import Model from "./model.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import { statusAvailable } from "../utils/common";
import { Customers } from "./customer.entity";

@Entity("chairs")
export class Chairs extends Model {
  @Column({
    nullable: false,
  })
  label!: string;

  @Column({
    nullable: false,
  })
  chair_no!: string;

  @Column({
    default: statusAvailable,
    nullable: false,
  })
  status!: string;

  @Column()
  price!: number;

  @Column({ nullable: true })
  customer_id!: number;

  @Column({ nullable: true })
  customer_name!: string;

  @Column({ nullable: true })
  approve_by!: string;

  @Column({ nullable: true })
  user_id!: number;

  @ManyToOne(() => Desks, (desk) => desk.chairs)
  @JoinColumn({ name: "desk_id" })
  desk!: Desks;
}
