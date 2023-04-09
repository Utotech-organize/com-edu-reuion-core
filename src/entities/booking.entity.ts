import Model from "./model.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne } from "typeorm";
import { Desks } from "./desk.entity";
import { Customers } from "./customer.entity";

@Entity("bookings")
export class Bookings extends Model {
  @Column({ nullable: false, unique: true })
  slug!: string;

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

  @Column({ nullable: true })
  image_url!: string;

  @ManyToOne(() => Customers, (customer) => customer.bookings)
  @JoinColumn({ name: "customer_id" })
  customer!: Customers;

  @ManyToOne(() => Desks, (desk) => desk.bookings)
  @JoinColumn()
  desk!: Desks;
}
