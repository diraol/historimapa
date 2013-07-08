//Controler
edadosControler = (function($){
    var dataBoxVisible = false;

    function setDataBoxVisible(state){
        if (!arguments.length) return dataBoxVisible;
            dataBoxVisible = state;
            return dataBoxVisible;
    }

    return { 
        dataBoxVisible: setDataBoxVisible,
    };

})(jQuery);

//dataBox functions
function showDataBox(local, video, text) {
    edadosControler.dataBoxVisible("true");
    //Adiciona Fundo Preto
    $("body").append("<div id='backdrop' class='backdrop'></div>");
    $("#localidade").html(local);
    //Adiciona o iframe do vídeo
    $('<iframe />', {
        id: 'current-video',
        src: video,
        frameborder: '0',
        allowfullscreen: 'true'
    }).appendTo('#video');
    //Adiciona o conteudo textual à respectiva div
    $('#texto').html(text);
    //Mostra o fundo preto
    $("#backdrop").fadeIn(1000);
    //Mostra a janela de conteúdo
    $("#marker-content").fadeIn(1500);
    updateSize();
}

function hideMarkerContent() {
    edadosControler.dataBoxVisible("false");
    //Remove fundo preto
    $('#backdrop').remove();
    //esconde janela de conteúdo
    $('#marker-content').hide();
    //remove o iframe do vídeo
    $('#video').empty();
}

function _contentAvailableSize() {
    var div_width = $("#marker-content").width() - 30;
    var div_height = $("#marker-content").height() - $('.modal-header').height() - 40;

    return {'width': div_width, 'height': div_height};
}

function _videoSize() {
    var video_proportion = 1.78,
        div_size = _contentAvailableSize();

    if ( div_size.width < div_size.height * video_proportion ) {
        width = div_size.width,
        height = width/video_proportion;
    } else {
        height = div_size.height;
        width = height * video_proportion;
    }

    return {'height': height, 'width': width};
}

function _textSize() {
    return _contentAvailableSize();
}

function updateSize() {
    var video_size = _videoSize(),
        text_size = _textSize();
    
    //Limpando o container do iframe de video e adicionando um novo iframe baseado no vídeo requisitado
    $("#texto").css("height", text_size.height + "px");
    $("#texto").css("width", $('tab-content').width() + "px");
    $("iframe")[0].setAttribute("width", video_size.width);
    $("iframe")[0].setAttribute("height", video_size.height);
}

//Util
$(window).resize(function() {
    updateSize();
});

