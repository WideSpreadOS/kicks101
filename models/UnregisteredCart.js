module.exports = function UnregisteredCart(oldCart) {
      this.items = oldCart.items || {};
      this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    let tax = 0.06;
    this.totalWithTax = Math.trunc(this.totalWithTax * tax);

      this.add = function(item, id) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, size: item.chosenSize, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price.base * storedItem.qty;
        this.totalQty++
        this.totalPrice += storedItem.item.price.base        
      }

      this.generateArray = function() {
          let arr = [];
          for (let id in this.items) {
              arr.push(this.items[id]);
          }
          return arr;
      }
};