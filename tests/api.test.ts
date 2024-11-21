process.env.ENVIRONMENT = 'test'
import {CollectedEventRepository} from "../src/repository/CollectedEventRepository";
import {bootstrap} from "../src/util/bootstrap";
import { FastifyInstance, FastifyBaseLogger, FastifyTypeProviderDefault } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";

describe('API Tests', () => {

    let server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyBaseLogger, FastifyTypeProviderDefault>;
    beforeAll(async () => {
        server = await bootstrap();
    })

    describe('Routes', () => {
        describe('GET /events', () => {
            const GET_RESULT =  [
                {
                    "_id": "673f3f06ffab72a97f5bd08c",
                    "chain": "POLYGON",
                    "integrator": "0xc4F9dA423AbC6927997838153EA18F1ABF9d5a98",
                    "lifiFee": "600000000000000000",
                    "integratorFee": "2400000000000000000",
                    "blockNumber": 61534685,
                    "token": "0x0000000000000000000000000000000000000000",
                    "__v": 0,
                    "createdAt": "2024-11-21T14:09:10.700Z",
                    "updatedAt": "2024-11-21T14:09:10.700Z"
                }];

            let getSpy;
            beforeEach(() => {
                getSpy = jest.spyOn(CollectedEventRepository.prototype, 'query').mockResolvedValueOnce(GET_RESULT as any)
            })

            describe('Pagination', () => {
                test('When no pagination is present should fallback to the default number of records', async () => {
                    const result = await server.inject({ method: 'GET', url: '/events'})
                    const response = result.json();
                    expect(getSpy).toHaveBeenCalledWith({}, 100, undefined)
                    expect(response).toEqual({ events:  GET_RESULT});
                    expect(result.statusCode).toEqual(200)
                })
                test('When page is not present but records are it should fetch the correct number of records', async () => {
                    const result = await server.inject({ method: 'GET', url: '/events', query: { records: '100000'}})
                    const response = result.json();
                    expect(getSpy).toHaveBeenCalledWith({}, 100000, undefined)
                    expect(response).toEqual({ events:  GET_RESULT});
                    expect(result.statusCode).toEqual(200)
                })

                test('When page and records are present it should use the correct offsets', async () => {
                    const result = await server.inject({ method: 'GET', url: '/events', query: { records: '100000', page: '5'}})
                    const response = result.json();
                    expect(getSpy).toHaveBeenCalledWith({}, 100000, 500000)
                    expect(response).toEqual({ events:  GET_RESULT});
                    expect(result.statusCode).toEqual(200)
                })
            })


            describe('Filtering', () => {
                test('When integrator is specified it should pass the value to the query', async () => {
                    const result = await server.inject({ method: 'GET', url: '/events', query: { integrator: '0xFFFFFF'}})
                    const response = result.json();
                    expect(getSpy).toHaveBeenCalledWith({ integrator: '0xFFFFFF'}, 100, undefined)
                    expect(response).toEqual({ events:  GET_RESULT});
                    expect(result.statusCode).toEqual(200)
                })
            })

        })
    });
});