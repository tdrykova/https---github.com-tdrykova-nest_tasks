import { DataSource, EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Injectable } from '@nestjs/common';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

// @EntityRepository(Task)
@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status: status });
    }

    if (search) {
      query.andWhere('(task.title LIKE :search OR task.desc LIKE :search)', {
        search: `%${search}%`,
      });
    }
    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, desc } = createTaskDto;

    const task = new Task();
    task.title = title;
    task.desc = desc;
    task.status = TaskStatus.OPEN;
    await task.save();

    return task;
  }
}
