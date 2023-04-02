import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chair } from "./chair.entity";

@Entity("desk")
export class Desk extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column()
  label!: string;

  @Column()
  status!: string;

  @OneToMany(() => Chair, (chair) => chair.id)
  chair!: Chair[];
}
