import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Lession } from "./lession.entity";
import Model from "./model.entity";
import { Pretest } from "./pretest.entity";
import { User } from "./user.entity";

@Entity("pretest_results")
export class PretestResult extends Model {
  @Column()
  answer_choosed!: string;

  @Column()
  label_answer_choosed!: string;

  @Column()
  is_answer_correct!: boolean;

  @ManyToOne(() => User, (u) => u.pretestResults, {
    nullable: false,
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Pretest, (pret) => pret.pretestResults, {
    nullable: false,
  })
  @JoinColumn({ name: "pretest_id" })
  pretest!: Pretest;
}
