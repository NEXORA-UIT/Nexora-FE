import { describe, it, expect } from "vitest";
import { cardApi } from "../card.api";

describe("cardApi Operations & OCC", () => {
  it("updates card fields and checks OCC updatedAt", async () => {
    const card = await cardApi.getCardById("card-101");
    const currentUpdatedAt = card.updatedAt;

    // Conflicting updatedAt should throw CARD_CONFLICT
    await expect(
      cardApi.updateCard("card-101", {
        title: "Conflicting title update",
        updatedAt: "2020-01-01T00:00:00.000Z",
      })
    ).rejects.toThrow("CARD_CONFLICT");

    // Valid update with current updatedAt
    const updated = await cardApi.updateCard("card-101", {
      title: "Updated copydeck title",
      description: "Updated description text",
      updatedAt: currentUpdatedAt,
    });

    expect(updated.title).toBe("Updated copydeck title");
    expect(updated.description).toBe("Updated description text");
    expect(updated.updatedAt).not.toBe(currentUpdatedAt);
  });

  it("adds, toggles, and deletes checklist items", async () => {
    const initialCard = await cardApi.getCardById("card-101");
    const initialTasksCount = initialCard.tasksCount;

    // Add task
    const newTask = await cardApi.addChecklistItem("card-101", "Verify SEO metadata");
    expect(newTask.title).toBe("Verify SEO metadata");
    expect(newTask.isCompleted).toBe(false);

    const cardAfterAdd = await cardApi.getCardById("card-101");
    expect(cardAfterAdd.tasksCount).toBe(initialTasksCount + 1);

    // Toggle task
    const toggled = await cardApi.updateChecklistItem(newTask.id, { isCompleted: true });
    expect(toggled.isCompleted).toBe(true);

    const cardAfterToggle = await cardApi.getCardById("card-101");
    expect(cardAfterToggle.completedTasksCount).toBeGreaterThanOrEqual(2);

    // Delete task
    await cardApi.deleteChecklistItem(newTask.id);
    const cardAfterDelete = await cardApi.getCardById("card-101");
    expect(cardAfterDelete.tasksCount).toBe(initialTasksCount);
  });

  it("adds a comment and lazy-loads activities", async () => {
    const comment = await cardApi.addComment("card-101", "Ready for deployment test");
    expect(comment.content).toBe("Ready for deployment test");

    const activities = await cardApi.getActivities("card-101");
    expect(Array.isArray(activities)).toBe(true);
    expect(activities.length).toBeGreaterThanOrEqual(1);
  });

  it("deletes a card according to OpenAPI deleteCard", async () => {
    // Create a temporary card to delete
    const tempCard = await cardApi.createCard("col-todo", { title: "Card to delete" });
    expect(tempCard).toBeDefined();

    await cardApi.deleteCard(tempCard.id);
    await expect(cardApi.getCardById(tempCard.id)).rejects.toThrow("Card not found");
  });

  it("adds and deletes a dependency", async () => {
    // Add dependency: card-102 depends on card-101
    const dep = await cardApi.addDependency("card-102", {
      dependsOnCardId: "card-101",
    });

    expect(dep.cardId).toBe("card-102");
    expect(dep.prerequisiteCardId).toBe("card-101");

    const card = await cardApi.getCardById("card-102");
    expect(card.dependencies?.some((d) => d.id === dep.id)).toBe(true);

    // Delete dependency
    await cardApi.deleteDependency("card-102", dep.id);
    const cardAfterDelete = await cardApi.getCardById("card-102");
    expect(cardAfterDelete.dependencies?.some((d) => d.id === dep.id)).toBe(false);
  });

  it("rejects self-dependency in addDependency", async () => {
    await expect(
      cardApi.addDependency("card-101", {
        dependsOnCardId: "card-101",
      })
    ).rejects.toThrow("Cannot depend on self");
  });
});
