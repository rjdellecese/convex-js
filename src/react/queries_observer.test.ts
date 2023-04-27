import { Value } from "../values/index.js";
import { test, beforeEach, afterEach, expect, jest } from "@jest/globals";
import FakeWatch from "../test/fake_watch";
import { QueriesObserver } from "./queries_observer";

let queriesObserver: QueriesObserver;
let createWatch: jest.MockedFunction<
  (name: string, args: Record<string, Value>) => FakeWatch<any>
>;
let listener: jest.MockedFunction<() => void>;

beforeEach(() => {
  createWatch = jest.fn(() => new FakeWatch<any>()) as any;
  queriesObserver = new QueriesObserver(createWatch);
  listener = jest.fn() as any;
  queriesObserver.subscribe(listener);
});

afterEach(() => {
  queriesObserver.destroy();
});

test("setting queries updates `getCurrentQueries`", () => {
  // Adding a query changes the current queries.
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: {},
    },
  });
  expect(queriesObserver.getCurrentQueries()).toStrictEqual({
    query: undefined,
  });
  // The listener isn't notified for our own changes.
  expect(listener.mock.calls.length).toBe(0);

  // If we update the value of the query, the listener is notified and the
  // current queries include the update.
  createWatch.mock.results[0].value.setValue("query value");
  expect(listener.mock.calls.length).toBe(1);
  expect(queriesObserver.getCurrentQueries()).toStrictEqual({
    query: "query value",
  });
});

test("If the query name changes, only stay subscribed to the second name", () => {
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: {},
    },
  });

  queriesObserver.setQueries({
    query: {
      name: "myQuery2",
      args: {},
    },
  });

  // The listener isn't notified for our own changes.
  expect(listener.mock.calls.length).toBe(0);

  // There were 2 watches created. We should be subscribed to only the second.
  expect(createWatch.mock.calls.length).toBe(2);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(0);
  expect(createWatch.mock.results[1].value.numCallbacks()).toBe(1);
});

test("If the query args change, only stay subscribed to the second args", () => {
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: { arg: "first arg" },
    },
  });

  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: { arg: "new arg" },
    },
  });

  // The listener isn't notified for our own changes.
  expect(listener.mock.calls.length).toBe(0);

  // There were 2 watches created. We should be subscribed to only the second.
  expect(createWatch.mock.calls.length).toBe(2);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(0);
  expect(createWatch.mock.results[1].value.numCallbacks()).toBe(1);
});

test("If the query doesn't change, we only have one subscription", () => {
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: { arg1: "arg1", arg2: 1, arg3: {} },
    },
  });
  expect(createWatch.mock.calls.length).toBe(1);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(1);

  // Re-adding the same query doesn't create a new watch.
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: { arg1: "arg1", arg2: 1, arg3: {} },
    },
  });
  expect(createWatch.mock.calls.length).toBe(1);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(1);
});

test("destroy unsubscribes from all queries", async () => {
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: {},
    },
  });

  queriesObserver.destroy();

  // No subscriptions to the watch now.
  expect(createWatch.mock.calls.length).toBe(1);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(0);
});

test("swapping createWatch recreates subscriptions", async () => {
  queriesObserver.setQueries({
    query: {
      name: "myQuery",
      args: {},
    },
  });
  // We should have a listen for the query.
  expect(createWatch.mock.calls.length).toBe(1);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(1);
  // Pretend that the server sent us a query journal
  createWatch.mock.results[0].value.setJournal("query journal");

  // Swap out the `createWatch` function.
  const createWatch2 = jest.fn(() => new FakeWatch<any>()) as any;
  queriesObserver.setCreateWatch(createWatch2);

  // No subscriptions left for the original watch.
  expect(createWatch.mock.calls.length).toBe(1);
  expect(createWatch.mock.results[0].value.numCallbacks()).toBe(0);

  // Now there is a sub using the new createWatch function and the
  // journal was passed through!
  expect(createWatch2.mock.calls.length).toBe(1);
  expect(createWatch2.mock.results[0].value.numCallbacks()).toBe(1);
  expect(createWatch2.mock.calls[0]).toEqual(["myQuery", {}, "query journal"]);
});
