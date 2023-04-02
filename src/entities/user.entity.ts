import { Entity, Column, Index, BeforeInsert, OneToMany } from "typeorm";
import bcrypt from "bcryptjs";
import Model from "./model.entity";

@Entity("users")
export class Users extends Model {
  @Index("email_index")
  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @Column({
    nullable: false,
  })
  name!: string; // fistname and lastname

  @Column({
    nullable: true,
  })
  remark!: string;

  @Column({
    nullable: false,
  })
  tel!: string;

  @Column({
    default: "admin",
    type: String,
    nullable: false,
  })
  role!: string;

  @Column({ nullable: true })
  photo_url!: string; //FIXME to base64 image

  // @OneToMany(() => PretestResult, (preResult) => preResult.pretest) //FIXME relate with chair
  // pretestResults!: PretestResult[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  toJSON() {
    return {
      ...this,
      password: undefined,
      verified: undefined,
    };
  }
}
