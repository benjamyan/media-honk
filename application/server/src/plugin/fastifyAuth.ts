import { FastifyReply, FastifyRequest } from "fastify";
import { default as fp } from 'fastify-plugin';
import { default as BasicAuth } from '@fastify/basic-auth';
import { $Logger, _Config } from "../server";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

export const fastifyAuth = fp(function(instance, _opts, done) {    
    instance.register(BasicAuth, {
        validate: async function validate (username: string, password: string, req: FastifyRequest, reply: FastifyReply) {
            for (const user of _Config.local.api.users) {
                if (user.includes(username) && user.includes(password)) return;
            }
            throw new Error('Bad credentials')
        },
        authenticate: true
    });
    instance.after(()=> {
        instance.addHook('onRequest', instance.basicAuth);
        instance.addHook('onError', async (req, reply, err)=> {
            $Logger.error(err.statusCode);
            if (err.statusCode === 401) {
                reply.code(302).send()
                return
            }
            reply.send(err)
        });
        instance.after(()=> {
            instance.route({
                method: 'GET',
                url: '/',
                onRequest: instance.basicAuth,
                handler: async (_req, res)=> {
                    const file = readFileSync(resolve(__dirname, '../../static/index.html'))
                    res.type('text/html').send(file);
                    return 
                }
            })
        });
    });
    done();
})
