import { BaseRepository } from "./base.repository";
import { Dish, DishSchema } from "../schemas/dish.schema";

class MenuRepository extends BaseRepository<Dish> {
  constructor() {
    super("dishes");
  }

  async getTopPicks(): Promise<Dish[]> {
    const results = await this.find({ isTopPick: true });
    return results.map(d => DishSchema.parse(d));
  }

  async getByCategory(category: string, isDesktop = true): Promise<Dish[]> {
    const query = isDesktop ? { categoryDesktop: category } : { categoryMobile: category };
    const results = await this.find(query);
    return results.map(d => DishSchema.parse(d));
  }
}

export const menuRepository = new MenuRepository();
