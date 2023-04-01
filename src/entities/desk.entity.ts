import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chair } from "./chair.entity";

@Entity("desk")
export class Desk extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column()
  title!: string;

  @Column()
  status!: boolean;

  @OneToMany(() => Chair, (chair) => chair.id)
  chair!: Chair[];
}
