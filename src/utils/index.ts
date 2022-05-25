import { RedisClientType } from '@node-redis/client';
import { createClient, SchemaFieldTypes, AggregateGroupByReducers, AggregateSteps } from 'redis';

const createUserIndex = async ( client: RedisClientType) => {
    
    await client.ft.create('idx:users', {
        '$.name': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: 'UNF'
        },
        '$.age': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'age'
        },
        '$.coins': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'coins'
        },
        '$.email': {
          type: SchemaFieldTypes.TAG,
          AS: 'email'
        }
      }, {
        ON: 'JSON',
        PREFIX: 'noderedis:users'
      });
    } catch (e) {
      if (e.message === 'Index already exists') {
        console.log('Index exists already, skipped creation.');
      } else {
        // Something went wrong, perhaps RediSearch isn't installed...
        console.error(e);
        process.exit(1);
      }
}