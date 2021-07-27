# pager-service

This repository holds a part of the models and business logic to implement a Pager Service to manage on-call shifts in a company that have several services that need to be monitored.

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

(*) For the sake of preventing the violation of the SRP, the action of receiving an Acknowledgement is not modeled in this use case but considered part of the previous conditions when triggering the execution of this use case.

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

### ▶️ `ReceiveHealthyEvent`

As mentioned above, this vertical simply takes care of receiving a Healthy Event and sets the associated Monitored Service in a Healthy State.

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

The code is organized in contexts related to the main business concepts. For this case, the only context created is `incidentNotification` since all the business logic implemented is somehow related to this idea.

Under a directory with the same name, `incidentNotification`, we find the folder `core` that holds all the different use cases (`core/useCases` directory) and the models needed to implement the whole vertical (`core/models`).

The communication between the Use Cases (core) and the Application layer (controllers, cron jobs, command-line clients, queues, etc) as well as with the Infrastructure layer (databases, outgoing queues, etc) is done via Ports. These Ports are implemented using TypeScript interfaces.

![pager-service-arch](https://user-images.githubusercontent.com/7657547/127133468-2a66b365-aafd-45f6-b767-0dbf28446fb9.png)
 
For this exercise, just the outgoing Ports and the Core layers -colored in the previous diagram- have been coded. The rest of the layers have been mocked when testing the Use Cases.

## 🤗️ Acknowledgements

This repository has been built using [jsynowiec/node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) for the scaffolding.


