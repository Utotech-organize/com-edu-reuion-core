import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chairs } from "./chair.entity";
import { Bookings } from "./booking.entity";

@Entity("desks")
export class Desks extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column()
  label!: string;

  @Column()
  status!: string;

  @Column()
  price!: number;

  @OneToMany(() => Chairs, (chair) => chair.id)
  chairs!: Chairs[];

  @OneToMany(() => Bookings, (booking) => booking.customer)
  bookings!: Bookings[];
}
