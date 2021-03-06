import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  serverReady,
  stubRecaptcha,
  user,
  uuid
} from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../../src/app/api/localStorage'
const storage = new LocalStorageApi(user.email)

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
beforeEach(async () => {
  await storage.storage.clear()
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
})

async function expectOneItemArray(promise, callback) {
  await (
    promise.then(arr => {
      expect(Array.isArray(arr)).toBe(true)
      expect(arr.length).toBe(1)
      
      if (callback) {
        callback(arr)
      }
    })
  )
}

async function addContent() {
  const topicGuid = uuid()
  await storage.updateTopic(doc.guid, topicGuid, { archived: true, guid: topicGuid, title: 'Test Topic' })
  const chapterGuid = uuid()
  await storage.updateChapter(doc.guid, chapterGuid, {
    archived: false,
    content: { ops: [] },
    guid: chapterGuid,
    title: 'Test Chapter',
    topics: {
      [topicGuid]: {
        guid: topicGuid,
        content: { ops: [] }
      }
    }
  })
  const planGuid = uuid()
  await storage.updatePlan(doc.guid, planGuid, {
    archived: true,
    guid: planGuid,
    title: 'Test Plan',
    sections: []
  })
  const sectionGuid = uuid()
  await storage.updateSection(doc.guid, planGuid, sectionGuid, {
    archived: false,
    content: { ops: [] },
    guid: sectionGuid,
    tags: [],
    title: 'Test Section'
  })
}

test('do a full local storage export with no content', async () => {
  await expectOneItemArray(storage.getFullExport())
})

test('import a hand-made export to local storage', async () => {
  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: []
  }, {
    guid: uuid(),
    name: 'Doc 2',
    chapters: [],
    topics: [],
    plans: []
  }]

  await storage.storage.clear()
  await storage.doFullImport(importable)

  storage.getFullExport().then(docs => {
    expect(Array.isArray(docs)).toBe(true)
    expect(docs.length).toBe(2)
    expect(docs).toEqual(importable)
  })
})

test('immediately import an export with no content to local storage', async () => {
  const exported = await storage.getFullExport()
  await storage.storage.clear()
  await storage.doFullImport(exported)
  await expectOneItemArray(storage.getFullExport())
})

test('do a full export with content from local storage', async () => {
  await addContent()

  await expectOneItemArray(storage.getFullExport(), docs => {
    const doc = docs[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
  })
})

test('immediately import an export with content to local storage', async () => {
  await addContent()
  
  const exported = await storage.getFullExport()
  await storage.doFullImport(exported)

  await expectOneItemArray(storage.getAllDocuments())
  await expectOneItemArray(storage.getAllPlans(doc.guid), plans => {
    const sections = plans[0].sections
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBe(1)
  })
  await expectOneItemArray(storage.getAllChapters(doc.guid))
  await expectOneItemArray(storage.getAllTopics(doc.guid))

  await expectOneItemArray(storage.getFullExport(), docs => {
    const doc = docs[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
  })
})

test('when the import to local storage breaks, it is reverted', async () => {
  const console_err = console.error
  console.error = function () {}

  const importable = []

  await storage.doFullImport(importable)

  await expectOneItemArray(storage.getAllDocuments())
  await expectOneItemArray(storage.getFullExport(), docs => {
    const exported = docs[0]
    expect(exported.name).toBe(doc.name)
    expect(exported.guid).toBe(doc.guid)
  })

  console.error = console_err
})
