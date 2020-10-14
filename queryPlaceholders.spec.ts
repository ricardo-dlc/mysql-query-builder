/* eslint-disable node/no-unpublished-import */
import {mySqlQueryBuilder} from './queryPlaceholders';
import {assert} from 'chai';
import 'mocha';

const user = {
  id: 123,
  status: {
    active: true,
  },
  services: {
    home: {
      route: '/',
    },
    dashboard: {
      route: '/dashboard',
    },
  },
  name: 'John',
  email: 'email@mail.com',
};

describe('MySQL with nulls for missing option in one level object value', () => {
  it('MySQL with nulls for missing key value', () => {
    const query =
      'SELECT * FROM users WHERE id = :id AND last_name = :lastName;';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'SELECT * FROM users WHERE id = ? AND last_name = ?;',
      values: [123, null],
    });
  });

  it('MySQL with insert and close by placeholders', () => {
    const query = 'INSERT INTO users (name, email) VALUES (:name, :email);';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'INSERT INTO users (name, email) VALUES (?, ?);',
      values: ['John', 'email@mail.com'],
    });
  });
});

describe('MySQL with nulls for missing option in one or more level object value', () => {
  it('MySQL with nulls for missing key.name.value', () => {
    const query =
      'SELECT * FROM users WHERE id = :id AND created_at = :status.since;';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'SELECT * FROM users WHERE id = ? AND created_at = ?;',
      values: [123, null],
    });
  });

  it('MySQL with insert and close by placeholders key.name.value', () => {
    const query =
      'INSERT INTO users (email, default_route) VALUES (:email, :services.dashboard.route);';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'INSERT INTO users (email, default_route) VALUES (?, ?);',
      values: ['email@mail.com', '/dashboard'],
    });
  });
});

describe('MySQL without nulls for missing option', () => {
  it('Missing parameter error', () => {
    let errorMessage = '';
    try {
      const query = 'SELECT * FROM users WHERE username = :username;';
      mySqlQueryBuilder(query, user, {useNullForMissing: false});
    } catch (e) {
      errorMessage = e.message;
    }
    assert(
      errorMessage.startsWith('Missing value for statement.\n    username')
    );
  });
  it('Missing parameter error for key.name.value', () => {
    let errorMessage = '';
    try {
      const query =
        'SELECT * FROM users WHERE username = :username.info.status;';
      mySqlQueryBuilder(query, user, {useNullForMissing: false});
    } catch (e) {
      errorMessage = e.message;
    }
    assert(
      errorMessage.startsWith(
        'Missing value for statement.\n    username.info.status'
      )
    );
  });
});
