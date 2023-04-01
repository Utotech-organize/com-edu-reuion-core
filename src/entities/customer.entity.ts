import { Entity, Column, Index, BeforeInsert, OneToMany } from "typeorm";
import bcrypt from "bcryptjs";
import Model from "./model.entity";

@Entity("customer")
export class Customer extends Model {
  @Column({
    nullable: false,
  })
  name!: string; // fistname and lastname

  @Index("tel_index")
  @Column({
    unique: true,
  })
  @Column({
    nullable: false,
  })
  tel!: string;

  @Column({
    nullable: true,
  })
  information!: string;

  @Column({})
  email!: string;

  @Column({
    default: "customer",
    type: String,
    nullable: false,
  })
  role!: string;

  @Column({ nullable: true })
  line_liff_id!: string;

  @Column({ nullable: true })
  line_display_name!: string;

  @Column({ nullable: true })
  line_photo_url!: string;

  // @OneToMany(() => PretestResult, (preResult) => preResult.pretest) //FIXME relate with chair
  // pretestResults!: PretestResult[];
}
