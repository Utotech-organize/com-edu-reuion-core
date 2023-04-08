import Model from "./model.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import { statusAvailable } from "../utils/common";
import { Customers } from "./customer.entity";

@Entity("bookings")
export class Bookings extends Model {
  @ManyToOne(() => Customers, (customer) => customer.bookings)
  customer!: Customers;

  @ManyToOne(() => Desks, (desk) => desk.bookings)
  desk!: Desks;
}
