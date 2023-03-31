import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Lession } from "./lession.entity";
import Model from "./model.entity";
import { PretestResult } from "./pretest-result.entity";

/* Pretest is a class that extends Model and has a bunch of columns */
@Entity("pretests")
export class Pretest extends Model {
  @Column({
    nullable: false,
  })
  question!: string;

  @Column()
  answer_1!: string;

  @Column()
  answer_2!: string;

  @Column()
  answer_3!: string;

  @Column()
  answer_4!: string;

  @Column()
  correct_answer!: string;

  @ManyToOne(() => Lession, (lession) => lession.pretests)
  @JoinColumn({ name: "lession_id" })
  lession!: Lession;

  @OneToMany(() => PretestResult, (preResult) => preResult.pretest)
  pretestResults!: PretestResult[];
}
