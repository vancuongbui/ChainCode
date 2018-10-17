module.exports =  async (promise, desc) => {
    try {
        await promise;
    } catch (err) {
        return;
    }
    assert.isTrue(false, desc);
}
