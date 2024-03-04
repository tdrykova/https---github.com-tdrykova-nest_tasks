import { TaskStatus } from '../task.model';

// shape of data that we expect after parsing object
export class GetTasksFilterDto {
  status: TaskStatus;
  search: string;
}
