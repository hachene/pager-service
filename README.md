# pager-service

This repository holds a part of the models and business logic to implement a Pager Service to manage on-call shifts in a company that have several services that need to be monitored.

## 🚀️ Quick Start

To launch the tests you can clone the repository and trigger the execution with the following steps:

```
git clone git@github.com:hachene/pager-service.git
cd pager-service
yarn
yarn test
```

This will also generate a coverage report.

## 🧠 Business Logic Overview

The repository covers three different use cases:

### `NotifyUnhealthyService`
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

### `ReceiveAcknowledgementTimeout`
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

### `ReceiveHealthyEvent`

As mentioned above, this vertical simply takes care of receiving a Healthy Event and sets the associated Monitored Service in a Healthy State.


## 🤗️ Acknowledgements

This repository has been built using [jsynowiec/node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) for the scaffolding.


