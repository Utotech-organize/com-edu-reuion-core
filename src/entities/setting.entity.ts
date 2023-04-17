import Model from "./model.entity";
import { Column, Entity } from "typeorm";

@Entity("settings") //FIXME
export class Settings extends Model {
  @Column({ nullable: true })
  bank!: string;

  @Column({ nullable: true })
  bank_account_name!: string;

  @Column({ nullable: true })
  bank_account_no!: string;

  @Column({ nullable: true })
  bank_qr_code!: string;
}
