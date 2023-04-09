import Model from "./model.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import { Customers } from "./customer.entity";

@Entity("bookings")
export class Bookings extends Model {
  @Column({})
  status!: string;

  @Column({})
  payment_status!: string;

  @Column({})
  inspector!: string;

  @Column({ nullable: true })
  chairs_id!: string;

  @Column({ nullable: true })
  total!: number;

  @Column({ nullable: true })
  qrcode_image!: string;

  @ManyToOne(() => Customers, (customer) => customer.bookings)
  customer!: Customers;

  @ManyToOne(() => Desks, (desk) => desk.bookings)
  desk!: Desks;
}
