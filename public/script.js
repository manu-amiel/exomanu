(function ($) {
    console.log('self execute');
    $('#ajax_user').hide();
    $('#ajax_edit').hide();
    $('#ajax_genre').hide();
    $('#ajax_add_genre').hide();
    $('#ajax_add_album').hide();

    $('.pop_add_user').click(function() {
        $('#ajax_user').fadeIn(800);
        $('#ajax_edit').hide();
        $('#ajax_genre').hide();
        $('#ajax_add_genre').hide();
    });
    $('.pop_add_genre').click(function(){
        $('#ajax_add_genre').fadeIn(800);
        $('#ajax_edit').hide();
        $('#ajax_user').hide();
        $('#ajax_add_album').hide();
    })

    $(document).ready(function () {
        index();
        editGenre();
        edit_user();
        addUser();
        displayGenre();
        addGenre();
        addAlbum();
    });
    function addUser(){
        // add user   
        var $userFormAjax = $('#ajax_user');                
        $userFormAjax.on('submit', function(e){
            e.preventDefault();
            var Name 		= $('#name').val();
            var Firstname	= $('#firstname').val();
            var Gender 		= $('#gender').val();
            var Birthdate 	= $('#birthdate').val();
            
            $.ajax({
                url: '/add_user',
                type: "POST",
                dataType: "json",
                data: {
                    "Name"     : Name,
                    "Firstname": Firstname,
                    "Gender"   : Gender,
                    "Birthdate": Birthdate,   
                },
                // fin d'envoi
                async: true,                   
            }).then(function(result) {
                
                console.log(result);
                console.log('result');
                
                index();
                
                $('#ajax_user').fadeOut(800);
                $userFormAjax.find("#name, #firstname, #gender, #birthdate").val(""); // vide 
                
                
            });	
            
            return false;				
        });
    };
    function edit_user() {
        // Delete user
        $('.action-delete').click(function(e){
            e.preventDefault();
            console.log('o');
            var id_user_delete = e.currentTarget.value;
            console.log(id_user_delete)
            $.ajax({
                url: '/delete/user',
                type: "GET",
                dataType: "json",
                data: {
                    "id_delete" : id_user_delete,
                },
                async: true,
            }).then(function(){
                index();
                console.log('user deleted');
            });
        });
        

        $('.edit_user').click(function(e) {
            e.preventDefault();
            console.log('edit');
            var id = e.currentTarget.value;
            console.log(id);
            var Name 		= $('#name-edit').val();
            var Firstname	= $('#firstname-edit').val();
            var Gender 		= $('#gender-edit').val();
            var Birthdate 	= $('#birthdate-edit').val();
            console.log(Name);
            $.ajax({
                url: "/edit-user",
                type: "POST",
                dataType: "json",
                data: {  
                    "Id_edit"       : id,
                    "Name_edit"     : Name,
                    "Firstname_edit": Firstname,
                    "Gender_edit"   : Gender,
                    "Birthdate_edit": Birthdate,
                },
                async: true,
            }).then(function(result){
                console.log(result);
                index();
                
                $('#ajax_edit').fadeOut(1500);
            });
        })

    };
    function displayAlbum(result2){
        $('#list_genres').empty();
        
        for(g = 0; g < result2.genres.length; g++) {

            // $('div>ol').empty();
            // $('ol>ul').empty();
            // $('ul>li').empty();
        }
       
        for(g = 0; g < result2.genres.length; g++) { 
            
            var id_genre_album = result2.genres[g].Id_genre;
            var shearch = ".count" + result2.genres[g].Id_genre
            var id_genre = $(shearch).val();
            console.log(id_genre);
            
            if (result2.genres){
                if (result2.genres[g].Id_genre != id_genre ){
                    
                    console.log(result2.genres[g].Id_genre)
                    $('ul').append(` 
                        <li>
                            <div>` + result2.genres[g].Name_genre + `
                            <button class="btn-danger action_delete_genre count`+result2.genres[g].Id_genre+`" value="` + result2.genres[g].Id_genre + `">supprimer</button>
                            <button class="action_add_album" value="` + result2.genres[g].Id_genre + `">Ajout d'album</button>
                            </div>
                            <div class="render_album">
                                <ol id="list_album`+ result2.genres[g].Id_genre +`">
                                </ol>
                            </div>
                        </li>
                        <br>
                    `); 
                }
                
                
                
                if (id_genre_album == result2.genres[g].genre_id){
                    var list_album = "#list_album" + id_genre_album;
                    
                    console.log(result2.genres[g].Id_album)
                    
                    $(list_album).append(`
                    <li>
                        <div class="render_list_album">
                            ` + result2.genres[g].Name_album + ` ` + result2.genres[g].genre_id + `
                            <button class="btn-danger action_delete_album" value="` + result2.genres[g].Id_album + `">x</button>
                        </div>
                    </li>
                    `);
                
                    console.log(result2.genres[g]);
                
                    
                }
            
            
            
                $('.action_add_album').click(function(e){
                    $('.genre_album_id').val(e.currentTarget.value);
                    $('#ajax_add_album').find("textarea, :text, select, hidden").val("").end().find(":checked").prop("checked", false); // vide 
                    $('#ajax_add_album').hide();
                    $('#ajax_add_album').fadeIn();
                    $('#ajax_add_genre').hide(); 
                    
                });
                deleteAlbum();
                editGenre();
            }
            
        }
    }
    function displayGenre() {
        $('ul>li').empty();
        $('#ajax_add_genre').hide();
        
       
        var id_genre = $('.genre_id').val();
        console.log(id_genre);
        //debugger
                $.ajax({
                    url: '/ajax_genre',
                    type: "GET",
                    dataType: "json",
                    data: {
                        "id_genre" : id_genre,
                    },
                    async: true,
                }).then(function(result2) {
                    console.log(result2)
                    console.log(result2.genres);
                    console.log('result_genres');
                    editGenre();
                   
                    if (result2.genres){
                    var result2 = displayAlbum(result2);
                    
                    }
                });
                
                
    }
    function addGenre(){
        /// ADD GENRE 
        var $genreFormAjax = $('#ajax_add_genre');
        $genreFormAjax.on('submit', function(e){ 
            e.preventDefault();
            var Name_genre = $('#name_genre').val();
            var user_id    = $('.genre_id').val();
            console.log(user_id);
            $.ajax({
                url: "/add/genre",
                type: "POST",
                dataType: "json",
                data: {
                    'Name_genre' : Name_genre,
                    'user_id'    : user_id,
                },
                // fin d'envoi
                async: true,                   
            }).then(function(result){
                
                $('#list_genres').empty();
                
                displayGenre(result);
                $genreFormAjax.find("#name_genre").val("") // vide le formulaire Add Genre;    
        
            })
            return false;  
        });
    };
    function addAlbum(){
        /// ADD ALBUM
      
        var $albumFormAjax = $('#ajax_add_album');
        $albumFormAjax.on('submit', function(e){ 
            console.log('addalbum')
            e.preventDefault();
            var Name_album = $('#name_album').val();
            var genre_id    = $('.genre_album_id').val();
            console.log(genre_id);
            $.ajax({
                url: "/add/album",
                type: "POST",
                dataType: "json",
                data: {
                    'Name_genre' : Name_album,
                    'genre_id'    : genre_id,
                },
                // fin d'envoi
                async: true,                   
            }).then(function(result){
                
                console.log(result);
                $('#ajax_add_album').hide();
                $('#list_genres').empty();
                displayGenre();
                $albumFormAjax.find("#name_album, #album_id").val("") // vide le formulaire Add Album;

                //notification add album
                var notif_user = $('.genre_id').val();
                user_notif = ".notif"+notif_user;
                $('.notif').append("<span>l'utilisateur " + notif_user + " a ajouté un album !</span>");
                $('.notif').fadeIn(500).delay(5000).fadeOut(3500);
                $(user_notif).hide();
            

                
            });
            return false;  
        });
    };
    function deleteAlbum(){
        /// DELETE ALBUM
        $('.action_delete_album').click(function(e) {
            e.preventDefault();
            var id = e.currentTarget.value ;
            console.log(id);
            $.ajax({
                url: "/delete/album",
                type: "GET",
                dataType: "json",
                data: {
                    "id_album" : id,
                },
                // fin d'envoi
                async: true,                   
            }).then(function(){
                
               displayGenre();
                
            })
            return false;  
        });
    }
    function editGenre(){
        // DELETE GENRE
        $('.action_delete_genre').click(function(e) {
            e.preventDefault();
            $('#ajax_add_album').hide();
            $('#ajax_add_genre').hide();
            var id = e.currentTarget.value;
            console.log(id);
            $.ajax({
                url: "/delete/genre",
                type: "GET",
                dataType: "json",
                data: {
                    "genre_id" : id,
                },
                // fin d'envoi
                async: true,                   
            }).then(function(result){
                console.log('del');
                console.log(result);
                $('#list_genres').empty();
                displayGenre();
            })
            return false;  
        });
        
        
    };
    function index(){
        
        $.ajax({
            url: '/ajax',
            type: "GET",
            dataType: "json",
            async: true,
        }).then(function(result) {
            console.log('result');
            $('.num_users').html('Liste des casses couilles ' + result.users.length);
            $('tbody>tr').empty();
            console.log(result.users);
            for(i = 0; i < result.users.length; i++) {
                 
               
                $('.tbody').append(`<tr>
                    <td class="`+ result.users[i].Id_user +`">`+ result.users[i].Id_user +` <div style="z-index:10; position:relative" class="notif notif`+ result.users[i].Id_user +` alert notif alert-success notifhidden" role="alert"></div></td>
                    <td class="name`+ result.users[i].Id_user +`">`+ result.users[i].Name_user +`</td>
                    <td class="firstname`+ result.users[i].Id_user +`">`+ result.users[i].Firstname +`</td>
                    <td class="birthdate`+ result.users[i].Id_user +`">`+ result.users[i].Birthdate +`</td>
                    <td class="genre`+ result.users[i].Id_user +`">`+ result.users[i].Genre +`</td>
                    <td class="d-print-none">
                        <button onClick="
                        $('#ajax_edit').hide();
                        $('#ajax_edit').fadeIn(800);
                        $('#ajax_user').hide();
                        $('#ajax_genre').hide();
                        $('#btn_edit').addClass('action-edit');
                        $('#btn_edit').val(`+ result.users[i].Id_user +`);
                        " class="btn btn-sm btn-warning pop_edit" value="`+ result.users[i].Id_user +`">Modifier</button>
                        <button class="btn btn-sm btn-danger action-delete" value="`+ result.users[i].Id_user +`">Effacer</button>
                    </td>
                    <td class="">
                    <button onClick="
                        $('#ajax_genre').hide();
                        $('#ajax_edit').hide();
                        $('#ajax_user').hide();
                        $('#ajax_genre').fadeIn(800);
                        $('#list_genres').removeAttr('class');  
                        $('#list_genres').addClass('`+ result.users[i].Id_user +`');
                        $('#btn_add_genre').val('`+ result.users[i].Id_user +`');
                        $('.genre_id').val('`+ result.users[i].Id_user +`');
                        $('#list_genres').empty();
                        $('#ajax_add_genre').hide()
                    " class="btn btn-sm btn-secondary action-genre" value="`+ result.users[i].Id_user +`">Genre</button>
                    </td>
                </tr>`);
                
            };
            edit_user();
            $('.notif').hide()
            
            $('.action-genre').click(function(e) {
                //var id_genre_album = $('.genre_id').val();
                displayGenre();
                
                $('#ajax_add_genre').find("textarea, :text, select").val("").end().find(":checked").prop("checked", false); // vide le formualaire au click Genre
                
            });
           
        }); 

        
        
    };

})(jQuery);
