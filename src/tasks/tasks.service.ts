import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';



@Injectable()
export class TasksService {
  constructor(
    // @InjectRepository(Task)
    private taskRepository: TaskRepository,
  ) {}

  

  getTasks(
    filterDto: GetTasksFilterDto,
    user: User  
  ): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  //   getAllTasks(): Task[] {
  //     return this.tasks;
  //   }

  //   getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
  //     const { status, search } = filterDto;
  //     let tasks = this.getAllTasks();

  //     if (status) {
  //       tasks = tasks.filter((task) => task.status === status);
  //     }

  //     if (search) {
  //       tasks = tasks.filter(
  //         (tasks) => tasks.title.includes(search) || tasks.desc.includes(search),
  //       );
  //     }

  //     return tasks;
  //   }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: {
        id: id,
        userId: user.id
      },
    });

    if (!found) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return found;
  }

  async createTask(
    createTaskDto: CreateTaskDto, 
    user: User
  ): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const res = await this.taskRepository.delete({id, userId: user.id});

    if (res.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
