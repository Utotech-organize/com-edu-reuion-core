import { Chairs } from "../entities/chair.entity";
import { Desks } from "../entities/desk.entity";
import { chairPrice, statusAvailable, tablePrice } from "./common";
import { AppDataSource } from "./data-source";

const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);
const countDesk = 30;

export const initDeskAndChairs = async () => {
  let mockdata = generateDeskinComedu(countDesk);

  const desks = await deskRepository.save(mockdata);

  desks.map(async (desk) => {
    let chairs;
    let input_chairs: any = desk.chairs;
    let new_chairs: Chairs[] = [];
    for (var i of input_chairs) {
      let chairTemp = {
        label: i.label,
        status: i.status,
        price: i.price,
        chair_no: i.chair_no,
        desk: {
          id: desk.id,
        } as Desks,
      } as Chairs;
      new_chairs.push(chairTemp);
    }
    chairs = await chairRepository.save(new_chairs);
    desk!.chairs = chairs as Chairs[];
  });
};

function generateDeskinComedu(count: any) {
  const labelDesk = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
    "E1",
    "E2",
    "E3",
    "E4",
    "E5",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
  ];

  const allDesk = [];

  for (let index = 0; index < count; index++) {
    let deskinComedu = {
      active: true,
      label: labelDesk[index],
      status: statusAvailable,
      price: tablePrice,
      chair_price: chairPrice,
      chairs: [
        {
          label: "A",
          status: statusAvailable,
          chair_no: "one",
          price: chairPrice,
        },
        {
          label: "B",
          status: statusAvailable,
          chair_no: "two",
          price: chairPrice,
        },
        {
          label: "C",
          status: statusAvailable,
          chair_no: "three",
          price: chairPrice,
        },
        {
          label: "D",
          status: statusAvailable,
          chair_no: "four",
          price: chairPrice,
        },
        {
          label: "E",
          status: statusAvailable,
          chair_no: "five",
          price: chairPrice,
        },
        {
          label: "F",
          status: statusAvailable,
          chair_no: "six",
          price: chairPrice,
        },
        {
          label: "G",
          status: statusAvailable,
          chair_no: "seven",
          price: chairPrice,
        },
        {
          label: "H",
          status: statusAvailable,
          chair_no: "eight",
          price: chairPrice,
        },
        {
          label: "I",
          status: statusAvailable,
          chair_no: "nine",
          price: chairPrice,
        },
        {
          label: "J",
          status: statusAvailable,
          chair_no: "ten",
          price: chairPrice,
        },
      ],
    };
    allDesk.push(deskinComedu);
  }

  return allDesk;
}
