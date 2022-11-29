const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

                return userData
            }
            
            throw new AuthenticationError('Not logged in');
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },

        saveBook: async (parent, args, context) => {
            const updateUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.bookData } },
                { new: true, runValidators: true }
            )
            return updateUser
        },

        removeBook: async (parent, args, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
            )
            return updatedUser
        },

        login: async (parent, args) => {
            const user = await User.findOne({ $or: [{ username: args.username }, { email: args.email }] });
            if(!user) {
                throw new AuthenticationError('Not logged in')
            }
            const correctPw = await user.isCorrectPassword(args.password);
            if(!correctPw) {
                throw new AuthenticationError('Not logged in');
            }
            const token = signToken(user);
            return { token, user}
        }
    }
}

module.exports = resolvers





