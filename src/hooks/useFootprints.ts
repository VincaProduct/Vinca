import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Footprint,
  FootprintComment,
  FootprintEntry,
  FootprintsState,
} from '@/types/footprints';
import {
  buildFootprintEntry,
  getDefaultFootprints,
  loadFootprints,
  loadFootprintsState,
  saveFootprints,
  saveFootprintsState,
} from '@/utils/footprintUtils';

const emptyState: FootprintsState = {
  likes: {},
  comments: {},
  commentLikes: {},
};

const sortByCreatedAt = (items: Footprint[]) => {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
};

export const useFootprints = (ownerId?: string) => {
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [state, setState] = useState<FootprintsState>(emptyState);

  useEffect(() => {
    setFootprints(loadFootprints());
    setState(loadFootprintsState<FootprintsState>(emptyState));
  }, []);

  useEffect(() => {
    saveFootprints(footprints);
  }, [footprints]);

  useEffect(() => {
    saveFootprintsState(state);
  }, [state]);

  const defaultFootprints = useMemo(() => getDefaultFootprints(), []);

  const userFootprints = useMemo(() => sortByCreatedAt(footprints), [footprints]);

  const allFootprints = useMemo(
    () => [...userFootprints, ...sortByCreatedAt(defaultFootprints)],
    [defaultFootprints, userFootprints]
  );

  const getFootprintById = useCallback(
    (id: string) => allFootprints.find((item) => item.id === id),
    [allFootprints]
  );

  const addFootprint = useCallback(
    (entry: FootprintEntry) => {
      const footprint = buildFootprintEntry(entry, ownerId);
      setFootprints((prev) => [footprint, ...prev]);
      return footprint;
    },
    [ownerId]
  );

  const updateFootprint = useCallback(
    (id: string, updates: Partial<Footprint>) => {
      setFootprints((prev) =>
        prev.map((footprint) =>
          footprint.id === id ? { ...footprint, ...updates } : footprint
        )
      );
    },
    []
  );

  const deleteFootprint = useCallback((id: string) => {
    setFootprints((prev) => prev.filter((item) => item.id !== id));
    setState((prev) => {
      const { likes, comments, commentLikes } = prev;
      const nextLikes = { ...likes };
      const nextComments = { ...comments };
      const nextCommentLikes = { ...commentLikes };
      delete nextLikes[id];
      delete nextComments[id];
      delete nextCommentLikes[id];
      return {
        likes: nextLikes,
        comments: nextComments,
        commentLikes: nextCommentLikes,
      };
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setState((prev) => {
      const liked = !prev.likes[id];
      setFootprints((prevFootprints) =>
        prevFootprints.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const likeCount = Math.max(0, (item.likeCount ?? 0) + (liked ? 1 : -1));
          return { ...item, likeCount };
        })
      );

      return {
        ...prev,
        likes: {
          ...prev.likes,
          [id]: liked,
        },
      };
    });
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    const comment: FootprintComment = {
      id: `comment_${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    setState((prev) => {
      const nextComments = {
        ...prev.comments,
        [id]: [comment, ...(prev.comments[id] ?? [])],
      };
      return { ...prev, comments: nextComments };
    });
  }, []);

  const addReply = useCallback((footprintId: string, commentId: string, text: string) => {
    setState((prev) => {
      const commentList = prev.comments[footprintId] ?? [];
      const updatedComments = commentList.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }
        return {
          ...comment,
          replies: [
            {
              id: `reply_${Date.now()}`,
              text: text.trim(),
              createdAt: new Date().toISOString(),
              likes: 0,
            },
            ...comment.replies,
          ],
        };
      });

      return {
        ...prev,
        comments: {
          ...prev.comments,
          [footprintId]: updatedComments,
        },
      };
    });
  }, []);

  const toggleCommentLike = useCallback((footprintId: string, commentId: string) => {
    setState((prev) => {
      const commentLikeMap = prev.commentLikes[footprintId] ?? {};
      const wasLiked = commentLikeMap[commentId] === 1;
      const nextCommentLikes = {
        ...prev.commentLikes,
        [footprintId]: {
          ...commentLikeMap,
          [commentId]: wasLiked ? 0 : 1,
        },
      };

      const updatedComments = (prev.comments[footprintId] ?? []).map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }
        return {
          ...comment,
          likes: Math.max(0, comment.likes + (wasLiked ? -1 : 1)),
        };
      });

      return {
        ...prev,
        commentLikes: nextCommentLikes,
        comments: {
          ...prev.comments,
          [footprintId]: updatedComments,
        },
      };
    });
  }, []);

  const isOwner = useCallback(
    (footprint: Footprint) => Boolean(ownerId && footprint.ownerId === ownerId),
    [ownerId]
  );

  return {
    userFootprints,
    allFootprints,
    state,
    addFootprint,
    updateFootprint,
    deleteFootprint,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    getFootprintById,
    isOwner,
  };
};
