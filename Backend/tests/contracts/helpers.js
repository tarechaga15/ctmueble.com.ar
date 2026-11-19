function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      return payload;
    }
  };
}

function createNextSpy() {
  const spy = () => {
    spy.called = true;
  };
  spy.called = false;
  return spy;
}

module.exports = {
  createMockRes,
  createNextSpy
};

