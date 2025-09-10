class FomValidateDate {

    constructor() {
        this.form = document.getElementById("reminderForm")
        this.btn = document.getElementById('submitBtn');
        this.loader = document.getElementById('btnLoader');
        this.text = document.getElementById('btnText');
        this.dateInput = document.getElementById('date');
        this.expireInput = document.getElementById('post_expire');
        this.expireWrapper = document.getElementById('expireWrapper');
        this.statusSelect = document.getElementById('post_status');
    }
}

console.log(FomValidateDate)