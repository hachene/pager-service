import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { Alert } from './models/Alert'
import { EscalationPolicy } from './models/EscalationPolicy'
import { MonitoredService, MonitoredServiceStatus } from './models/MonitoredService'
import { EmailTarget } from './models/Target/EmailTarget'
import { SmsTarget } from './models/Target/SmsTarget'
import { NotifyUnhealthyService } from './NotifyUnhealthyService'

describe('NotifyUnhealthyService', () => {
  let subject: NotifyUnhealthyService
  let monitoredService: MonitoredService
  let alert: Alert
  let markMonitoredServiceAsUnhealthyMock: jest.Mock<any, any>
  let getEscalationPolicyByServiceIdMock: (id: MonitoredService['id']) => EscalationPolicy

  beforeEach(() => {
    markMonitoredServiceAsUnhealthyMock = jest.fn()
    const persistanceAdapterMock: PersistanceInterface = {
      markMonitoredServiceAsUnhealthy: markMonitoredServiceAsUnhealthyMock,
    }

    const targetsFirstLevel = [
      new EmailTarget({ emailAddress: 'raquel@aircall.com' }),
      new EmailTarget({ emailAddress: 'juan@aircall.com' }),
    ]
    const targetsLastLevel = [
      new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00' }),
      new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00' }),
    ]

    const returnedEscalationPolicy = new EscalationPolicy({
      monitoredServiceId: 1,
      levels: [targetsFirstLevel, targetsLastLevel],
    })

    getEscalationPolicyByServiceIdMock = jest.fn(() => returnedEscalationPolicy)

    const escalationPolicyServiceAdapterMock: EscalationPolicyServiceInterface = {
      getEscalationPolicyByServiceId: getEscalationPolicyByServiceIdMock,
    }

    subject = new NotifyUnhealthyService(persistanceAdapterMock, escalationPolicyServiceAdapterMock)
  })

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in an Healthy State', () => {
    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeAll(() => {
        monitoredService = new MonitoredService({
          id: 1,
          status: MonitoredServiceStatus.healthy,
        })

        alert = new Alert({
          monitoredServiceId: 1,
        })
      })

      it('the Monitored Service becomes unhealthy', () => {
        subject.perform(alert)

        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledTimes(1)
        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledWith(alert.monitoredServiceId)
      })

      it('the Pager notifies all targets of the first level of the escalation policy', () => {
        subject.perform(alert)

        expect(getEscalationPolicyByServiceIdMock).toHaveBeenCalledTimes(1)
        expect(getEscalationPolicyByServiceIdMock).toHaveBeenCalledWith(alert.monitoredServiceId)
      })
    })
  })
})
