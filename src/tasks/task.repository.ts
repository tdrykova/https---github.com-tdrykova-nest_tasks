import { DataSource, EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';
import axios2 from 'axios';

// @EntityRepository(Task)
@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository')
  constructor(dataSource: DataSource, 
    // private readonly httpService: HttpService
    ) {
    super(Task, dataSource.createEntityManager());
  }

  async getCatFactsWithAxiosLib() {
    const response = await axios2({
       method: 'GET',
       url: 'https://catalog.api.2gis.com/3.0/items?q=достопримечательности Великий Новгород&fields=items.address,items.description,items.point,items.schedule,items.has_audiogid&type=adm_div.country,adm_div.city,attraction&key=7ede747a-5d2c-4b6e-b515-ad724eff80f1',
    }).catch(() => {
       throw new ForbiddenException('API not available');
    });

    return {
       data: {
          fact: JSON.stringify(response.data.result.items),
       },
    };
 }

  async getTasks(
    filterDto: GetTasksFilterDto,
    user: User  
  ): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    const res =  JSON.parse((await this.getCatFactsWithAxiosLib()).data.fact)
    console.log(res[0].authors)
   // query.where('task.userId = :userId', {userId: user.id});

   

    if (status) {
      query.andWhere('task.status = :status', { status: status });
    }

    if (search) {
      query.andWhere('(task.title LIKE :search OR task.desc LIKE :search)', {
        search: `%${search}%`,
      });
    }

    try {
      const tasks = await query.getMany();
      return tasks; 
    } catch (error) {
      this.logger.error(`Failed to get tasks for user "${user.username}". 
      Filters: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
    
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, desc } = createTaskDto;
    
    const res =  JSON.parse((await this.getCatFactsWithAxiosLib()).data.fact)
    const task = new Task();
    task.title = res[0].address.building_name //title;
    task.desc = res[0].description //desc;
    task.status = TaskStatus.OPEN;
    task.user = user;

    try {
      await task.save();
    } catch (error) {
      this.logger.error(`Failed to create a task for user "${user.username}". 
      Data: ${JSON.stringify(createTaskDto)}`, error.stack);
      throw new InternalServerErrorException()
    }

  // this.query('')
    
    
    delete task.user;
    return task;
  }
}

