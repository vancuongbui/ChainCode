/*
exports.add_new_user = function (user_address) {
    return true;
};

exports.post_new_artwork = function (user_address, artwork_info) {
    let artworkId = 1;
    return artworkId;
};
*/

function ACGChainAPI() {
    let contract20;
    let contract721;

    function set_contract(x, y) {
        contract20 = x;
        contract721 = y;
    }

    function add_new_user(user_address) {
        return true;
    }

    function post_new_artwork(user_address, artwork_info) {
        let artwork_id = 1;
        return artwork_id;
    }

    function buy_artwork(buyer_address, owner_address, artwork_id, artwork_prize) {
        let transaction_id = 0;
        return transaction_id;
    }

    function buy_token(buyer_address, value) {
        let transaction_id = 0;
        return transaction_id;
    }

    function freeze_token(buyer_address, artwork_id, artwork_prize, auction_time) {
        let transaction_id = 0;
        return transaction_id;
    }

    function check_artwork(artwork_id) {
        let owner_address;
        let artwork_info;
        return owner_address, artwork_info;
    }

    function check_user(user_address) {
        let type;
        let user_balance;
        let artwork_id;
        return type, user_balance, artwork_id;
    }

    function check_transaction(transaction_id) {
        return;
    }

    return {
        set_contract: set_contract,
        add_new_user: add_new_user,
        post_new_artwork: post_new_artwork,
        buy_artwork: buy_artwork,
        buy_token: buy_token,
        freeze_token: freeze_token,
        check_artwork: check_artwork,
        check_user: check_user,
        check_transaction: check_transaction
    };
}

module.exports = ACGChainAPI;