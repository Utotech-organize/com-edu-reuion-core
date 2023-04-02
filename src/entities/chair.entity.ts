import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import Model from "./model.entity";

@Entity("chairs")
export class Chairs extends Model {
  @Column({
    nullable: false,
  })
  label!: string;

  @Column({
    default: "available",
    nullable: false,
  })
  status!: string;

  @Column()
  price!: number;

  @ManyToOne(() => Desks, (desk) => desk.chairs)
  @JoinColumn({ name: "desk_id" })
  desk!: Desks;
}
