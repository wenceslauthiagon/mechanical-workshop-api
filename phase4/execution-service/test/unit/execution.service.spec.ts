import { ExecutionService } from '../../src/execution.service';

describe('ExecutionService', () => {
  it('should start execution and mark as completed', () => {
    let completed = false;
    const service = new ExecutionService((topic) => {
      if (topic === 'event.execution.completed') completed = true;
    });

    const record = service.start('o1');
    service.updateStatus(record.id, 'COMPLETED');

    expect(completed).toBe(true);
  });
});
