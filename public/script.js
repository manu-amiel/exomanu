(function ($) {

    var UserForm = function (options) {
        options = options || {};
        this.mode = options.mode || 'create';
        this.onDone = options.onDone || undefined;
        this.init();
    };

    UserForm.prototype = {
        routes: {
            getUser: {
                url: '/user',
                type: "GET",
                dataType: "json",
                async: true,
            },
            updateUser: {
                url: '/user/edit',
                type: "POST",
                dataType: "json",
                async: true,
            },
            addUser: {
                url: '/user/add',
                type: "POST",
                dataType: "json",
                async: true,
            },
        },

        /**
         * Initalise le formulaire
         */
        init: function () {
            var self = this;
            // Récupération de l'élément form
            this.$el = $('#frmUser');

            // Mapping général
            this.$title = this.$el.find('.title');
            this.$btnSubmit = this.$el.find('button[name=submit]');
            this.$btnSubmit.off('click').click(function(e) {
                e.preventDefault();
                self._onButtonClick();
            });
            this.$btnClose = this.$el.find('button[name=close]');
            this.$btnClose.off('click').click(function(e) {
                e.preventDefault();
                self.hide();
            });

            // Mapping des champs
            this.$id = this.$el.find('input[name=id]');
            this.$name = this.$el.find('input[name=name]');
            this.$firstname = this.$el.find('input[name=firstname]');
            this.$gender = this.$el.find('select[name=gender]');
            this.$birthdate = this.$el.find('input[name=birthdate]');

            // Initialisation du CSS
            this.$el.removeClass('bg-success bg-warning');

            if (this.mode === 'create') {
                this.$title.html('Ajouter un utilisateur');
                this.$btnSubmit.html('Ajouter');
                this.$el.addClass('bg-success');
                this.clear();
                this.show();
            } else {
                this.$title.html("Modifier l'utilisateur");
                this.$btnSubmit.html('Sauvegarder');
                this.$el.addClass('bg-warning');
            }
        },

        /**
         * Charge les données d'un utilisateur
         * @param {int} id : Identifiant de l'utilisateur
         */
        load: function (id) {
            var self = this;
            var route = $.extend(this.routes.getUser, {
                data: {id: id}
            });
            $.ajax(route).then(function (result) {
                // Changement du mode
                self.mode = 'edit';
                self.init();
                self.fill(result);
                self.show();
            });
        },

        /**
         * Remplit les champs
         * @param {Object} values : Valeurs pour remplire les champs
         */
        fill: function (values) {
            for (var prop in values) {
                this['$' + prop].val(values[prop]);
            }
        },

        /**
         * Vide les champs
         */
        clear: function () {
            [
                this.$id,
                this.$name,
                this.$firstname,
                this.$gender,
                this.$birthdate
            ].forEach(element => element.val(null));
        },

        /**
         * Retourne les valeurs des champs sous forme d'objet
         * @returns {Object} Valeurs des champs
         */
        values: function () {
            return {
                id: this.$id.val(),
                name: this.$name.val(),
                firstname: this.$firstname.val(),
                gender: this.$gender.val(),
                birthdate: this.$birthdate.val(),
            };
        },

        /**
         * Affiche le formulaire
         */
        show: function () {
            this.$el.fadeIn(800);
        },

        /**
         * Masque le formulaire
         */
        hide: function () {
            var self = this;
            this.$el.fadeOut(800, function () {
                self.clear();
                // Si un callback est définit lors de l'initialisation, on l'appelle
                if (self.onDone) {
                    self.onDone.apply(self);
                }
            });
        },

        //
        // Ensemble des callbacks à appeler lors des clics sur les boutons
        //
        _onButtonClick: function () {
            var self = this;
            var route = this.mode === 'create' ? this.routes.addUser : this.routes.updateUser;
            route = $.extend(route, {
                data: this.values()
            });
            $.ajax(route).then(function (result) {
                // Résultat OK -> On ferme
                if (result.status === 'ok') {
                    self.hide();
                }
            });
        },
    };

    /**
     * Classe permettant d'encapsuler la liste des utilisateurs
     * @param {string} selector 
     */
    var UserList = function (selector) {
        this.$el = $(selector);
    };

    UserList.prototype = {
        routes: {
            index: {
                url: '/users',
                type: "GET",
                dataType: "json",
                async: true,
            },

            deleteUser: {
                url: '/user/delete',
                type: "POST",
                dataType: "json",
                async: true,
            }
        },

        /**
         * Charge les données
         */
        load: function () {
            var self = this;
            $.ajax(this.routes.index).then(function (result) {
                var users = result.users;
                // Mise à jour de la quantité d'utilisateurs
                self.$el.find('#users_count').html('Liste des utilisateurs ' + users.length);
                // Référence vers le corps du tableau
                var $tableBody = self.$el.find('tbody');
                // Nettoyage du corps
                $tableBody.empty();
                // Ajout des lignes
                for (var idx in users) {
                    var user = users[idx];
                    var $userRow = $(`
                    <tr class="user" data-id="` + user.id + `">
                        <td>` + user.id + `</td>
                        <td>` + user.name + `</td>
                        <td>` + user.firstname + `</td>
                        <td>` + user.birthdate + `</td>
                        <td>` + user.gender + `</td>
                        <td>
                            <button class="btn btn-sm btn-primary" name='action_edit'>Modifier</button>
                            <button class="btn btn-sm btn-danger" name='action_delete'>Supprimer</button>
                            <button class="btn btn-sm btn-secondary" name='action_genders'>Genres</button>
                        </td>
                    </tr>
                    `);
                    $tableBody.append($userRow);
                }
                self.init();
            });
        },

        /**
         * Méthode utilitaire chargée de retourner la ligne correspondant à l'utilisateur
         * @param {*} e : Evènement généré à la suite d'un clic
         * @returns {jQuery.fn.init} Ligne
         */
        _uiBtnGetParentRow: function (e) {
            return $(e.currentTarget).parents('tr:first');
        },

        /**
         * Initialise la liste
         */
        init: function () {
            var self = this;
            this.$el.find('button[name=action_edit]').click(function (e) {
                var $row = self._uiBtnGetParentRow(e);
                var id = $row.data('id');
                self._onEdit(id, $row);
            });
            this.$el.find('button[name=action_delete]').click(function (e) {
                var $row = self._uiBtnGetParentRow(e);
                var id = $row.data('id');
                self._onDelete(id, $row);

            });
            this.$el.find('button[name=action_genders]').click(function (e) {
                var $row = self._uiBtnGetParentRow(e);
                var id = $row.data('id');
                self._onGenders(id, $row);
            });
        },

        //
        // Ensemble des callbacks à appeler lors des clics sur les boutons
        //

        /**
         * Se déclenche lorsque l'on clique sur le bouton Modifier
         * @param {int} id : Identifiant de l'utilisateur 
         * @param {*} $row : Ligne source
         */
        _onEdit: function (id, $row) {
            var self = this;
            var frm = new UserForm({
                onDone: function () {
                    self.load();
                }
            });
            frm.load(id);
        },

        /**
         * Se déclenche lorsque l'on clique sur le bouton Effacer
         * @param {int} id : Identifiant de l'utilisateur 
         * @param {*} $row : Ligne source
         */
        _onDelete: function (id, $row) {
            var self = this;
            var route = $.extend(this.routes.deleteUser, {
                data: {id: id}
            });
            $.ajax(route).then(function (result) {
                self.load();
            });
        },

        /**
         * Se déclenche lorsque l'on clique sur le bouton Genres
         * @param {int} id : Identifiant de l'utilisateur 
         * @param {*} $row : Ligne source
         */
        _onGenders: function (id, $row) {
            var self = this;
        }
    };

    $(document).ready(function () {
        // Chargement de la liste des utilisateurs
        var userList = new UserList('#user_list');
        userList.load();

        $('button[name=action_add_user]').click(function () {
            new UserForm({
                onDone: function (frm) {
                    userList.load();
                }
            });
        });
    });

})(jQuery);
