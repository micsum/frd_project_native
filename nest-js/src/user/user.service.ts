import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { LoginData } from './dto/login-user.dto';
import { checkPassword } from 'hash';
import { JWTService } from 'src/jwt/jwt.service';
import { TargetInputDTO } from './dto/targetInput.dto';
import { WeightInfoDTO } from './dto/weightInput.dto';
import { ExHistDTO } from './dto/exercise-history';
import { env } from 'env';

@Injectable()
export class UserService {
  constructor(
    //@ts-ignore
    @InjectKnex() private knex: Knex,
    private jwtService: JWTService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //console.log('new', createUserDto); check the confirm password drop

    const user_id = await this.knex('user')
      .insert(createUserDto)
      .returning('id');

    await this.knex('weight_record').insert({
      weight: createUserDto.weight,
      user_id: user_id[0].id,
      date: new Date(Date.now()),
    });
    return 'Successfully registered';
  }

  async checkDbUser(createUserDto: CreateUserDto) {
    let query = this.knex('user')
      .select('*')
      .where({ email: createUserDto.email })
      .orWhere({ username: createUserDto.username });

    let dbResult = await query;
    if (dbResult.length === 1) {
      return {
        error: 'User Existed.\n Please input another username / email.',
      };
    }
    return {};
  }

  async findAll(LoginData: LoginData) {
    const inputPassword = LoginData.password;
    let dbResult = await this.knex('user')
      .select('*')
      .where({ email: LoginData.email });

    if (dbResult.length === 0) {
      return {
        error: 'User does not exist.\nPlease input correct email.',
      };
    }

    let dbPassword = dbResult[0].password;
    let id = dbResult[0].id;
    let email = dbResult[0].email;
    let payload = { email, id };

    console.log(dbResult[0]);

    return (await checkPassword(inputPassword, dbPassword))
      ? { token: this.jwtService.encodeJWT(payload) }
      : { error: 'Wrong Password' };
  }

  async getBodyParams(userID: number) {
    return await this.knex('user')
      .select('height', 'weight')
      .where({ id: userID });
  }

  async getPersonalTarget(userID: number) {
    const personalTargetResult = await this.knex('personal_target_input')
      .select('*')
      .where({ user_id: userID });

    if (personalTargetResult.length === 0) {
      return { personalTarget: [] };
    }

    let personalTarget = personalTargetResult[0];
    const { start_date, expected_date } = personalTarget;
    personalTarget = {
      ...personalTarget,
      start_date: new Date(start_date.getTime() + 8 * 3600000),
      expected_date: new Date(expected_date.getTime() + 8 * 3600000),
    };
    return { personalTarget: [personalTarget] };
  }

  async updatePersonalTarget(userID: number, inputInfo: TargetInputDTO) {
    const targetInputResult = await this.knex('personal_target_input')
      .select('*')
      .where({ user_id: userID });

    if (targetInputResult.length !== 0) {
      await this.knex('personal_target_input').where({ user_id: userID }).del();
    }
    await this.knex('personal_target_input').insert({
      ...inputInfo,
      user_id: userID,
    });
    return {};
  }

  async updateStepsGoal(userID: number, goalInt: number) {
    const stepsGoalInDb = await this.knex('step_daily_goal')
      .select('*')
      .where({ user_id: userID });

    if (stepsGoalInDb.length !== 0) {
      await this.knex('step_daily_goal')
        .where({ user_id: userID })
        .update({ steps_dailygoal: goalInt });
    } else {
      await this.knex('step_daily_goal').insert({
        steps_dailygoal: goalInt,
        user_id: userID,
      });
    }
    return {};
  }

  async getStepGoal(userID: number) {
    const getStep = await this.knex('step_daily_goal')
      .select('steps_dailygoal')
      .where({ user_id: userID });
    return { getStep };
  }

  async getWeightInfo(userID: number) {
    return await this.knex('weight_record')
      .select('weight', 'date')
      .where({ user_id: userID });
  }

  async inputWeightInfo(userID: number, weightInputInfo: WeightInfoDTO) {
    const weightInfo = {
      ...weightInputInfo,
      weight: parseFloat(weightInputInfo.weight),
      user_id: userID,
    };
    await this.knex('user')
      .update({ weight: weightInputInfo.weight })
      .where({ id: userID });
    return await this.knex('weight_record').insert(weightInfo);
  }

  async writeExHistory(userID: number, exHistData: ExHistDTO) {
    const { event_name, start_time, end_time } = exHistData;

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    const durationInHours = Math.round(
      (endTime.getTime() - startTime.getTime()) / 3600000,
    );
    let totalBurntCalories: Number;
    let exHistoryInfo: any = {};
    try {
      const burntCaloriesURL = `https://api.api-ninjas.com/v1/caloriesburned?activity=${event_name}`;
      const res = await fetch(burntCaloriesURL, {
        method: 'GET',
        headers: { 'X-Api-Key': env.API_KEY },
      });
      let burntResult = await res.json();

      if (burntResult.length === 0) {
        return { error: 'Can not find this activity' };
      }
      totalBurntCalories = burntResult[0].calories_per_hour * durationInHours;
      exHistoryInfo = {
        start_time: startTime,
        end_time: endTime,
        event_duration: durationInHours,
        user_id: userID,
        burnt_calories: totalBurntCalories,
        event_name: event_name,
      };
      //console.log('api', burntResult[0].calories_per_hour);
    } catch (error) {
      console.log(error);
      return {
        error: 'API Error',
      };
    }
    await this.knex('exercise_history').insert(exHistoryInfo);
    return { burntCalories: totalBurntCalories };
  }
  async profileInfo(user_id: number) {
    const info = await this.knex('user')
      .select('email', 'height', 'weight', 'username', 'target')
      .where({ id: user_id });
    console.log({ info });

    return { info };
  }

  async getExData(user_id: number, date: Date) {
    const newDate = new Date(date).setHours(0, 0, 0, 0);

    return await this.knex('exercise_history')
      .select('burnt_calories', 'event_name', 'event_duration')
      .where({ user_id })
      .where('start_time', '>=', new Date(newDate))
      .where(
        'start_time',
        '<',
        new Date(new Date(newDate).getTime() + 24 * 3600000),
      );
  }
}
