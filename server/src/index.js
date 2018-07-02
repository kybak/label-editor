const {GraphQLServer} = require('graphql-yoga')
const {Prisma} = require('prisma-binding')

const resolvers = {
    Query: {
        templates(parent, {id, name}, ctx, info) {
            return ctx.db.query.templates({
                where: {
                    OR: [
                        {id: id},
                        {name: name}
                    ]

                }
            }, info)
        },
        template(parent, {id}, ctx, info) {
            return ctx.db.query.template({ where: { id : id } }, info)
        },
    },
    Mutation: {
        createTemplate(parent, {elements, name, height, width}, ctx, info) {
            return ctx.db.mutation.createTemplate(
                {
                    data: {
                        name: name,
                        height: height,
                        width: width,
                        elements: {create: elements}},
                },
                info,
            )
        },
        updateTemplate(parent, {tplId, name, height, width}, ctx, info) {
            return ctx.db.mutation.updateTemplate(
                {
                    data: {
                        name: name,
                        height: height,
                        width: width,
                    },
                    where: {id: tplId}
                },
                info,
            )
        },
        deleteTemplate(parent, {tplId}, ctx, info) {
            return ctx.db.mutation.deleteTemplate(
                {
                    where: {id: tplId}
                },
                info,
            )
        },
        createElement(parent, {element, tplId}, ctx, info) {
            return ctx.db.mutation.updateTemplate(
                {
                    data: {
                        elements: {
                            create: element
                        }
                    },
                    where: {id: tplId},
                },
                info,
            )
        },
        updateElement(parent, {element, tplId}, ctx, info) {
            return ctx.db.mutation.updateTemplate(
                {
                    data: {
                        elements: {
                            update: element
                        }
                    },
                    where: {id: tplId},
                },
                info,
            )
        },
        deleteElement(parent, {element, tplId}, ctx, info) {
            return ctx.db.mutation.updateTemplate(
                {
                    data: {
                        elements: {
                            delete: element
                        }
                    },
                    where: {id: tplId},
                },
                info,
            )
        }

    },
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
            endpoint: 'https://us1.prisma.sh/public-plumedragon-495/my-app/dev', // the endpoint of the Prisma API
            debug: true, // log all GraphQL queries & mutations sent to the Prisma API
            // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
        }),
    }),
})

server.start(() => console.log('Server is running on http://178.128.182.29:4000'))


/*
publish(parent, {id}, ctx, info) {
    return ctx.db.mutation.updatePost(
        {
            where: {id},
            data: {isPublished: true},
        },
        info,
    )
},*/
