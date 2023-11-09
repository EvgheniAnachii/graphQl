import { PubSub } from "graphql-subscriptions";
import { AuthorModel, ModuleModel, TrackModel } from "./models";

type ResolversType = {
  Query: {
    tracksForHome: (
      _,
      __,
      { dataSources }: { dataSources: any },
    ) => Promise<TrackModel[]>;
    module: (
      _,
      { id }: { id: any },
      { dataSources }: { dataSources: any },
    ) => Promise<ModuleModel>;
    track: (
      _,
      { id }: { id: any },
      { dataSources }: { dataSources: any },
    ) => Promise<TrackModel>;
  };
  Mutation: {
    incrementTrackViews: (
      _,
      args,
      { dataSources }: { dataSources: any },
    ) => Promise<
      | {
          code: number;
          success: boolean;
          message: string;
          track: TrackModel;
        }
      | { code: any; success: boolean; message: any; track: null }
    >;
  };
  Subscription: { trackUpdated: { subscribe: () => AsyncIterator<unknown> } };
  Track: {
    author: (
      { authorId }: { authorId: any },
      _,
      { dataSources }: { dataSources: any },
    ) => Promise<AuthorModel>;
    modules: (
      { id }: { id: any },
      _,
      { dataSources }: { dataSources: any },
    ) => Promise<ModuleModel[]>;
  };
};
export const getResolvers = (pubSub: PubSub): ResolversType => ({
  Query: {
    // returns an array of Tracks that will be used to populate the homepage grid of our web client
    tracksForHome: (_, __, { dataSources }) => {
      return dataSources.trackAPI.getTracksForHome();
    },

    // get a single track by ID, for the track page
    track: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getTrack(id);
    },

    // get a single module by ID, for the module detail page
    module: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getModule(id);
    },
  },
  Mutation: {
    // increments a track's numberOfViews property
    incrementTrackViews: async (_, args, { dataSources }) => {
      const { id } = args;
      try {
        const track = await dataSources.trackAPI.incrementTrackViews(id);
        console.log("args: ", args);
        await pubSub.publish("EVENT_CREATED", { trackUpdated: track });
        return {
          code: 200,
          success: true,
          message: `Successfully incremented number of views for track ${id}`,
          track,
        };
      } catch (err) {
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          track: null,
        };
      }
    },
  },
  Subscription: {
    trackUpdated: {
      subscribe: () => pubSub.asyncIterator(["EVENT_CREATED"]),
    },
  },
  Track: {
    author: ({ authorId }, _, { dataSources }) => {
      return dataSources.trackAPI.getAuthor(authorId);
    },

    modules: ({ id }, _, { dataSources }) => {
      return dataSources.trackAPI.getTrackModules(id);
    },
  },
});
