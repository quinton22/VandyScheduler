import { Teacher } from './graphql.types';

export type ActionReturnType<T extends keyof IRateMyProfessor> = Awaited<
  ReturnType<IRateMyProfessor[T]>
>;

export type ActionParameters<T extends keyof IRateMyProfessor> = Parameters<
  IRateMyProfessor[T]
>;

export type MessageRequest<T extends keyof IRateMyProfessor> = {
  action: T;
} & ([undefined] extends ActionParameters<T>
  ? {
      args?: ActionParameters<T>;
    }
  : { args: ActionParameters<T> });

export type OnMessageListener = Parameters<
  chrome.runtime.ExtensionMessageEvent['addListener']
>[0];

export interface IRateMyProfessor {
  getProfId(profName: string, schoolId?: string): Promise<string | undefined>;
  getOverallScore(profName: string): Promise<number | undefined>;
  getOverallScore(
    profName: string,
    schoolId?: string
  ): Promise<number | undefined>;
  getAllProfessors(schoolName?: string): Promise<Teacher[]>;
}
