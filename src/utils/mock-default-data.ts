import { Chairs } from "../entities/chair.entity";
import { Desks } from "../entities/desk.entity";
import { chairPrice, statusAvailable } from "./common";
import { AppDataSource } from "./data-source";

const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);

export const initDeskAndChairs = async () => {
  let mockdata = generateDeskinComedu(25);

  const desks = await deskRepository.save(mockdata);

  desks.forEach(async (desk) => {
    let chairs;
    let input_chairs: any = desk.chairs;
    let new_chairs: Chairs[] = [];
    for (var i of input_chairs) {
      let chairTemp = {
        label: i.label,
        status: i.status,
        price: i.price,
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
  ];

  const allDesk = [];

  for (let index = 0; index < count; index++) {
    let deskinComedu = {
      active: true,
      label: labelDesk[index],
      status: "pedding",
      chairs: [
        {
          label: "A",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "B",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "C",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "D",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "E",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "F",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "G",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "H",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "I",
          status: statusAvailable,
          price: chairPrice,
        },
        {
          label: "J",
          status: statusAvailable,
          price: chairPrice,
        },
      ],
    };
    allDesk.push(deskinComedu);
  }

  return allDesk;
}
