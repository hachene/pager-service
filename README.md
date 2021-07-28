# pager-service

This repository holds a part of the models and business logic to implement a Pager Service to manage on-call shifts in a company that has several services that need to be monitored.

## 🚀️ Quick Start

To launch the tests simply clone the repository and trigger the execution with the following steps:

```
git clone git@github.com:hachene/pager-service.git
cd pager-service
yarn
yarn test
```

This will also generate a coverage report.

## 🧠 Business Logic Overview

The repository covers three different use cases:

### ▶️ `NotifyUnhealthyService`
This vertical is responsible for:

**Scenario 1**
```
Given a Monitored Service in a Healthy State,
when the Pager receives an Alert related to this Monitored Service,
then the Monitored Service becomes Unhealthy,
the Pager notifies all targets of the first level of the escalation policy,
and sets a 15-minutes acknowledgement delay.
```

**Scenario 2**
```
Given a Monitored Service in an Unhealthy State,
when the Pager receives an Alert related to this Monitored Service,
then the Pager doesn’t notify any Target
and doesn’t set an acknowledgement delay
```

### ▶️ `ReceiveAcknowledgementTimeout`
This vertical is responsible for:

**Scenario 3**
```
Given a Monitored Service in an Unhealthy State,
the corresponding Alert is not Acknowledged
and the last level has not been notified,
when the Pager receives the Acknowledgement Timeout,
then the Pager notifies all targets of the next level of the escalation policy
and sets a 15-minutes acknowledgement delay.
```

**Scenario 4**
```
Given a Monitored Service in an Unhealthy State
when the Pager receives the Acknowledgement*
and later receives the Acknowledgement Timeout,
then the Pager doesn't notify any Target
and doesn't set an acknowledgement delay.
```

(*) For the sake of preventing the violation of the SRP, the action of receiving an Acknowledgement is not modeled in this use case but considered part of the previous conditions when triggering the execution of this Use Case. This vertical is implemented in `AcknowledgeAlert`.

**Scenario 5**
```
Given a Monitored Service in an Unhealthy State,
when the Pager receives a Healthy event related to this Monitored Service**
and later receives the Acknowledgement Timeout,
then the Monitored Service becomes Healthy,
the Pager doesn’t notify any Target
and doesn’t set an acknowledgement delay
```

(\*\*) For the sake of preventing the violation of the SRP, the action of receiving a Healthy Event is not modeled in this use case but implemented in the `ReceiveHealthyEvent` Use Case.

### ▶️ `AcknowledgeAlert`

As mentioned above, this vertical simply takes care of receiving an Acknowledgement related to an Alert and mark it as acknowledged.


### ▶️ `ReceiveHealthyEvent`

Similar to the previous one, this Use Case is in charge of receiving a Healthy Event and set the associated Monitored Service in a Healthy State.



## 🏗️ Project Architecture

The code has been written following a Ports and Adapters Architecture to keep the business logic fully decoupled from the infrastructure details.

Since this is an uncompleted application, the folder structure is not fully populated either.


```src
├── incidentNotification
│   ├── core
│   │   ├── models
│   │   └── useCases
│   └── ports
│       └── outgoing
└── testUtils
```

The code is organized in contexts related to the main business concepts. For this case, the only context created is `incidentNotification` since all the business logic implemented is, somehow, related to this idea.

Under a directory with the same name, `incidentNotification`, we find the folder `core` that holds all the different Use Cases (`core/useCases` directory) and the models needed to implement the whole vertical (`core/models`).

The communication between the Use Cases (core) and the Application layer (controllers, cron jobs, command-line clients, queues, etc) as well as with the Infrastructure layer (databases, outgoing queues, etc) is done via Ports. These Ports are implemented using TypeScript interfaces, so the dependency flow is inverted.

![pager-service-arch](https://user-images.githubusercontent.com/7657547/127133468-2a66b365-aafd-45f6-b767-0dbf28446fb9.png)
 
For this exercise, just the outgoing Ports and the Core layers -colored in the previous diagram- have been coded. The rest of the layers have been mocked when testing the Use Cases.

For persistence, the `PersistanceInterface` has been built to enforce the implementation of the following methods:

- `markMonitoredServiceAsUnhealthy` Given a Monitored Service Id it will mark it as Unhealthy.
- `markMonitoredServiceAsHealthy` Given a Monitored Service Id it will mark it as Healthy.
- `getMonitoredServiceById` Given a Monitored Service Id it will return the associated Monitored Service.
- `getAlertByMonitoredServiceId` Given a Monitored Service Id it will return an Alert Related to that Monitored Service.
- `markAlertAsAcknowledged` Given an Alert Id it will set the `isAcknowledged` attribute to true for the corresponding Alert entity.
- `incrementLastLevelContactedForAlert` Given an Alert Id it will increment by 1 the last contacted level of an Escalation Policy. This will alter the lastTargetsLevelNotified field. If there are no further levels to be contacted it will mark the `areLastLevelTargetsNotified` flag as true as well.

Using a relational database we could create several tables, one per model, and some of them may need to have foreign keys to make relations with Monitored Services (for instance, an Alert or an AcknowledgementTimeout are related to Monitored Services 1:1).

The database is also used to guarantee the pager-service does not send an Alert to the same Target if they already have an active Alert. Because of this, persisting the Target model in the database when a Target is alerted is crucial for the well functioning of the pager.

## 🏃‍♀️ Next Steps

This is an uncompleted project, the written code is a demonstration of how a pager-service could be implemented so there are multiple things to keep working on. Here are some interesting points to take into account:

- As explained in the previous section, when an Alert is sent to a Target, we need to persist it in the database to prevent the same Target to be alerted twice. This and other model persisting actions have not been implemented for the sake of simplicity.
- Since the adapters are not implemented, some of the tests needed too much mocking, making some of them a bit coupled to the implementation since, the tester, needs to know too much about the implementation of the UseCases. Here, some external modules could be created to test the proper integration with the adapters.
- The Use Cases should be implementing an interface, as well, to expose an incoming Port where their execution can be triggered without coupling it to a specific implementation.

## 🤗️ Acknowledgements

This repository has been built using [jsynowiec/node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) for the scaffolding.


