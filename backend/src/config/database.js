const { PrismaClient } = require("@prisma/client");

class Database {
  constructor() {
    if (Database._instance) {
      return Database._instance;
    }
    this._client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["warn", "error"]
          : ["error"],
    });
    Database._instance = this;
  }

  get client() {
    return this._client;
  }

  async connect() {
    await this._client.$connect();
    console.log("[db] connected to mongodb");
  }

  async disconnect() {
    await this._client.$disconnect();
    console.log("[db] disconnected");
  }
}

const db = new Database();

module.exports = { db, prisma: db.client };
