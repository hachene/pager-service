import { buildPersistenceInterfaceAdapterMock } from '../../../testUtils/mocks'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { Acknowledgement } from '../models/Acknowledgement'
import { AcknowledgeAlert } from './AcknowledgeAlert'

describe('AcknowledgeAlert', () => {
  let subject: AcknowledgeAlert

  const acknowledgement = new Acknowledgement({ alertId: 123 })

  let persistenceInterfaceAdapterMock: PersistenceInterface

  beforeEach(() => {
    persistenceInterfaceAdapterMock = buildPersistenceInterfaceAdapterMock()

    subject = new AcknowledgeAlert(persistenceInterfaceAdapterMock)
  })

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in an Unhealthy state', () => {
    it('sets the Monitored Service in a Healthy state', () => {
      subject.perform(acknowledgement)

      expect(persistenceInterfaceAdapterMock.markAlertAsAcknowledged).toHaveBeenCalledTimes(1)
      expect(persistenceInterfaceAdapterMock.markAlertAsAcknowledged).toHaveBeenCalledWith(acknowledgement.alertId)
    })
  })
})
