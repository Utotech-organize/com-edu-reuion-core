import Model from "./model.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import { statusAvailable } from "../utils/common";

@Entity("orders")
export class Orders extends Model {
  @Column({
    nullable: false,
  })
  status!: string;
}
