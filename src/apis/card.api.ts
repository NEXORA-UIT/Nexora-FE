import {
  cardCoreApi,
  cardTaskApi,
  cardAssignmentApi,
  cardLabelApi,
  cardCommentApi,
  cardAttachmentApi,
  cardDependencyApi,
  cardActivityApi,
} from "./card";

export * from "./card";

/**
 * Backward-compatible unified facade for card operations.
 * Aggregates all modular card resource APIs into a single client.
 *
 * Granular modules are also exported directly:
 * - `cardCoreApi`       - Card CRUD, move, archive, restore, delete
 * - `cardTaskApi`       - Checklist tasks
 * - `cardAssignmentApi` - Member assignments
 * - `cardLabelApi`      - Board and card labels
 * - `cardCommentApi`    - Comments
 * - `cardAttachmentApi` - File uploads and downloads
 * - `cardDependencyApi` - Prerequisite dependency links
 * - `cardActivityApi`   - Audit activity log
 */
export const cardApi = {
  ...cardCoreApi,
  ...cardTaskApi,
  ...cardAssignmentApi,
  ...cardLabelApi,
  ...cardCommentApi,
  ...cardAttachmentApi,
  ...cardDependencyApi,
  ...cardActivityApi,
};
