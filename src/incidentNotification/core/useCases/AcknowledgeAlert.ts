import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { Acknowledgement } from '../models/Acknowledgement'

export class AcknowledgeAlert {
  private persistence: PersistenceInterface

  constructor(persistence: PersistenceInterface) {
    this.persistence = persistence
  }

  public perform({ alertId }: Acknowledgement): void {
    this.persistence.markAlertAsAcknowledged(alertId)
  }
}
