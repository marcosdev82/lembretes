class FormValidateDate {
    constructor() {
        this.form = document.getElementById("reminderForm");
        this.btn = document.getElementById("submitBtn");
        this.loader = document.getElementById("btnLoader");
        this.text = document.getElementById("btnText");
        this.dateInput = document.getElementById("date");
        this.expireInput = document.getElementById("post_expire");
        this.expireWrapper = document.getElementById("expireWrapper");
        this.statusSelect = document.getElementById("post_status");
 
        this.init();
    }

    // Formata data para datetime-local
    formatDateForInput(date) {
        return date.toISOString().slice(0, 16);
    }

    // Atualiza status e botão de acordo com a data
    updateStatus() {
        const selectedDate = new Date(this.dateInput.value);
        const now = new Date();

        if (!this.dateInput.value) {
            this.statusSelect.value = "published";
            this.text.innerText = "Publicar";
            this.expireInput.value = "";
            return;
        }

        if (selectedDate > now) {
            this.statusSelect.value = "scheduled";
            this.text.innerText = "Agendar";
            this.expireInput.min = this.formatDateForInput(selectedDate);
        } else {
            this.statusSelect.value = "published";
            this.text.innerText = "Publicar";
            this.expireInput.value = "";
        }
    }

    // Validação de expiração
    validateExpire() {
        const expireDate = new Date(this.expireInput.value);
        const scheduleDate = new Date(this.dateInput.value);

        if (expireDate <= scheduleDate) {
            alert("A data de expiração deve ser maior que a data do agendamento!");
            this.expireInput.value = "";
        }
    }

    // Loader do botão
    handleButtonLoader() {
        this.text.classList.add("hidden");
        this.loader.classList.remove("hidden");
    }

    // Validação final no submit
    handleSubmit(e) {
        const selectedDate = this.dateInput.value.trim();
        const status = this.statusSelect.value;
        const expireDate = this.expireInput.value.trim();

        if (!selectedDate) {
            e.preventDefault();
            alert("A data do lembrete não pode estar vazia!");
            this.text.classList.remove("hidden");
            this.loader.classList.add("hidden");
            return;
        }

        if (status === "scheduled" && !expireDate) {
            e.preventDefault();
            alert("Para agendar, a data de expiração é obrigatória!");
            this.text.classList.remove("hidden");
            this.loader.classList.add("hidden");
            return;
        }
    }

    // Inicializa os eventos
    init() {
        if (!this.form) return;

        this.updateStatus();

        this.dateInput.addEventListener("change", () => this.updateStatus());
        this.expireInput.addEventListener("change", () => this.validateExpire());
        this.btn.addEventListener("click", () => this.handleButtonLoader());
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
}

// Inicializa a classe quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    new FormValidateDate();
});
