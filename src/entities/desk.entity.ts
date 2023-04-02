import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chairs } from "./chair.entity";

@Entity("desks")
export class Desks extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column()
  label!: string;

  @Column()
  status!: string;

  @OneToMany(() => Chairs, (chair) => chair.id)
  chairs!: Chairs[];
}
