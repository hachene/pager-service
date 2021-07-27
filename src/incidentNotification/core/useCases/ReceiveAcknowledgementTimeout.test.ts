import {
  buildSmsServiceAdapterMock,
  buildMailServiceAdapterMock,
  buildEscalationPolicyServiceAdapterMock,
  buildPersistenceInterfaceAdapterMock,
  buildTimerServiceAdapterMock,
} from '../../../testUtils/mocks'
import { EscalationPolicyServiceInterface } from '../../ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../../ports/outgoing/MailServiceInterface'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { SmsServiceInterface } from '../../ports/outgoing/SmsServiceInterface'
import { TimerServiceInterface } from '../../ports/outgoing/TimerServiceInterface'
import { AcknowledgementTimeout } from '../models/AcknowledgementTimeout'
import { Alert } from '../models/Alert'
import { EscalationPolicy } from '../models/EscalationPolicy'
import { MonitoredService, MonitoredServiceStatus } from '../models/MonitoredService'
import { EmailTarget } from '../models/Target/EmailTarget'
import { SmsTarget } from '../models/Target/SmsTarget'
import { ReceiveAcknowledgementTimeout } from './ReceiveAcknowledgementTimeout'

describe('ReceiveAcknowledgementTimeout', () => {
  let subject: ReceiveAcknowledgementTimeout

  const monitoredServiceId = 1
  const acknowledgementTimeout = new AcknowledgementTimeout({ monitoredServiceId })

  let smsServiceAdapterMock: SmsServiceInterface
  let mailServiceAdapterMock: MailServiceInterface
  let persistenceServiceAdapterMock: PersistenceInterface
  let timerServiceAdapterMock: TimerServiceInterface
  let escalationPolicyServiceAdapterMock: EscalationPolicyServiceInterface

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in a Healthy State', () => {
    beforeEach(() => {
      smsServiceAdapterMock = buildSmsServiceAdapterMock()
      mailServiceAdapterMock = buildMailServiceAdapterMock()

      const targetsFirstLevel = [
        new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
      ]
      const targetsLastLevel = [
        new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
      ]
      const returnedEscalationPolicy = new EscalationPolicy({
        monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
        levels: [targetsFirstLevel, targetsLastLevel],
      })

      const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
        getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
      })

      const returnedAlert = new Alert({
        id: 1,
        monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
        areLastLevelTargetsNotified: false,
        isAcknowledged: false,
      })

      const returnedMonitoredService = new MonitoredService({
        id: monitoredServiceId,
        status: MonitoredServiceStatus.healthy,
      })
      persistenceServiceAdapterMock = buildPersistenceInterfaceAdapterMock({
        getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
        getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
      })

      timerServiceAdapterMock = buildTimerServiceAdapterMock()

      subject = new ReceiveAcknowledgementTimeout(
        escalationPolicyServiceAdapterMock,
        persistenceServiceAdapterMock,
        timerServiceAdapterMock,
      )
    })

    it('the Pager does not notify any Target', () => {
      subject.perform(acknowledgementTimeout)

      expect(smsServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
      expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
    })

    it('the Pager does not set any acknowledgement delay', () => {
      subject.perform(acknowledgementTimeout)

      expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
    })
  })

  describe('given a Monitored Service in an Unhealthy State', () => {
    describe('and the corresponding Alert is not Acknowledged', () => {
      beforeEach(() => {
        smsServiceAdapterMock = buildSmsServiceAdapterMock()
        mailServiceAdapterMock = buildMailServiceAdapterMock()

        const targetsFirstLevel = [
          new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
          new EmailTarget({ emailAddress: 'juan@aircall.com', notificationService: mailServiceAdapterMock }),
        ]
        const targetsSecondLevel = [
          new SmsTarget({ phoneNumber: '+ 33 1 41 00 00 00', notificationService: smsServiceAdapterMock }),
        ]
        const targetsLastLevel = [
          new SmsTarget({ phoneNumber: '+ 33 1 55 55 55 55', notificationService: smsServiceAdapterMock }),
        ]
        const returnedEscalationPolicy = new EscalationPolicy({
          monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
          levels: [targetsFirstLevel, targetsSecondLevel, targetsLastLevel],
        })

        escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
          getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
        })

        const returnedAlert = new Alert({
          id: 1,
          monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
          areLastLevelTargetsNotified: false,
          isAcknowledged: false,
          lastTargetsLevelNotified: 0,
        })
        const returnedMonitoredService = new MonitoredService({
          id: monitoredServiceId,
          status: MonitoredServiceStatus.unhealthy,
        })
        persistenceServiceAdapterMock = buildPersistenceInterfaceAdapterMock({
          getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new ReceiveAcknowledgementTimeout(
          escalationPolicyServiceAdapterMock,
          persistenceServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })

      describe('and the last level has not been notified', () => {
        it('the Pager notifies all targets of the next level of the escalation policy when receive a timeout', () => {
          subject.perform(acknowledgementTimeout)

          expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(1)
          expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledWith('+ 33 1 41 00 00 00', {
            areLastLevelTargetsNotified: false,
            isAcknowledged: false,
            lastTargetsLevelNotified: 0,
            monitoredServiceId: 1,
          })
        })

        it('the Pager notifies the first level if the was not previous level notified', () => {
          const returnedAlert = new Alert({
            id: 1,
            monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
            areLastLevelTargetsNotified: false,
            isAcknowledged: false,
            lastTargetsLevelNotified: undefined,
          })
          const returnedMonitoredService = new MonitoredService({
            id: monitoredServiceId,
            status: MonitoredServiceStatus.unhealthy,
          })
          persistenceServiceAdapterMock = buildPersistenceInterfaceAdapterMock({
            getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
            getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
          })

          subject = new ReceiveAcknowledgementTimeout(
            escalationPolicyServiceAdapterMock,
            persistenceServiceAdapterMock,
            timerServiceAdapterMock,
          )

          subject.perform(acknowledgementTimeout)

          expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(2)
        })

        it('the Pager sets a 15-minutes acknowledgement delay', () => {
          subject.perform(acknowledgementTimeout)

          expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledTimes(1)
          expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledWith(15, {
            areLastLevelTargetsNotified: false,
            isAcknowledged: false,
            monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
            lastTargetsLevelNotified: 0,
          })
        })
      })
    })

    describe('and the corresponding Alert is Acknowledged', () => {
      beforeEach(() => {
        smsServiceAdapterMock = buildSmsServiceAdapterMock()
        mailServiceAdapterMock = buildMailServiceAdapterMock()

        const targetsFirstLevel = [
          new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
        ]
        const targetsLastLevel = [
          new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
        ]

        const returnedEscalationPolicy = new EscalationPolicy({
          monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
          levels: [targetsFirstLevel, targetsLastLevel],
        })

        const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
          getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
        })

        const returnedAlert = new Alert({
          id: 1,
          monitoredServiceId: acknowledgementTimeout.monitoredServiceId,
          areLastLevelTargetsNotified: false,
          isAcknowledged: true,
        })
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        persistenceServiceAdapterMock = buildPersistenceInterfaceAdapterMock({
          getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new ReceiveAcknowledgementTimeout(
          escalationPolicyServiceAdapterMock,
          persistenceServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })

      it('the Pager does not notify any Target', () => {
        subject.perform(acknowledgementTimeout)

        expect(smsServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
        expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
      })

      it('the Pager does not set any acknowledgement delay', () => {
        subject.perform(acknowledgementTimeout)

        expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
      })
    })
  })
})
