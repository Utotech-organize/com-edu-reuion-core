import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { Products } from "../entities/product.entity";

const productRepository = AppDataSource.getRepository(Products);
const selectProductColumn = [
  "products.id AS id",
  "products.created_at AS created_at",
  "products.updated_at AS updated_at",
  "products.deleted_at AS deleted_at",
  "products.label AS label",
  "products.quantity AS quantity",
  "products.price AS price",
  "products.Producting AS Producting",
];

export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    let new_product = {
      label: input.label,
      price: input.price,
      ordering: input.ordering,
      remark: input.remark,
      status: input.status,
    } as Products;

    const newProductItem = await productRepository.save(new_product);

    try {
      res.status(200).json({
        status: "success",
        id: newProductItem.id,
        message: "Product has been created",
        data: newProductItem,
      });
    } catch (err: any) {
      return responseErrors(
        res,
        500,
        "There was an error to create, please try again",
        err.message
      );
    }
  } catch (err: any) {
    return responseErrors(res, 400, "Can't create Product", err.message);
  }
};

export const getAllProductsHandler = async (req: Request, res: Response) => {
  try {
    const products = await productRepository
      .createQueryBuilder("products")
      .select(selectProductColumn)
      .where("products.deleted_at is null")
      .orderBy("products.ordering", "ASC")
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Product", err.message);
  }
};

export const getProductHandler = async (req: Request, res: Response) => {
  try {
    const product = await productRepository
      .createQueryBuilder("products")
      .select(selectProductColumn)
      .where("products.id = :id", { id: req.params.id })
      .getRawOne();

    if (!product) {
      return responseErrors(
        res,
        400,
        "Product not found",
        "cannot find Product"
      );
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Product", err.message);
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const product = await productRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!product) {
      return responseErrors(
        res,
        400,
        "Product not found",
        "cannot find Product"
      );
    }

    product.label = input.label;
    product.quantity = input.quantity;
    product.price = input.price;
    product.ordering = input.ordering;
    product.remark = input.remark;
    product.status = input.status;

    const updatedProduct = await productRepository.save(product);

    res.status(200).json({
      status: "success",
      data: updatedProduct,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Product", err.message);
  }
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!product) {
      return responseErrors(
        res,
        400,
        "Product not found",
        "cannot find Product"
      );
    }

    await productRepository.softDelete(product.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Product", err.message);
  }
};
